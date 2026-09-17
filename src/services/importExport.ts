import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export type FileData = {
  columns: string[];
  data: Record<string, any>[];
  fileName: string;
};

export const pickAndParseFile = async (): Promise<FileData | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return null;
    const asset = result.assets[0];
    const fileName = asset.name.toLowerCase();

    if (fileName.endsWith('.zip')) {
      return await parseZipFile(asset);
    } else if (fileName.endsWith('.csv')) {
      return await parseCsvFile(asset);
    } else if (fileName.endsWith('.xlsx')) {
      return await parseExcelFile(asset);
    } else {
      throw new Error("Định dạng file không được hỗ trợ. Vui lòng chọn .csv, .xlsx hoặc .zip");
    }
  } catch (error: any) {
    throw new Error(error.message || "Lỗi khi đọc file");
  }
};

const getFileContentBase64 = async (asset: DocumentPicker.DocumentPickerAsset) => {
  if (Platform.OS === 'web' && asset.file) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result.split(',')[1] || result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(asset.file!);
    });
  }
  return await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
};

const getFileContentText = async (asset: DocumentPicker.DocumentPickerAsset) => {
  if (Platform.OS === 'web' && asset.file) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(asset.file!);
    });
  }
  return await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
};

const parseCsvFile = async (asset: DocumentPicker.DocumentPickerAsset): Promise<FileData> => {
  const text = await getFileContentText(asset);
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          columns: results.meta.fields || [],
          data: results.data as Record<string, any>[],
          fileName: asset.name,
        });
      },
      error: (err: any) => reject(new Error(err.message)),
    });
  });
};

const parseExcelFile = async (asset: DocumentPicker.DocumentPickerAsset): Promise<FileData> => {
  const base64 = await getFileContentBase64(asset);
  const workbook = XLSX.read(base64, { type: 'base64' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
  
  if (data.length === 0) {
    return { columns: [], data: [], fileName: asset.name };
  }
  
  const columns = Object.keys(data[0]);
  return { columns, data, fileName: asset.name };
};

const parseZipFile = async (asset: DocumentPicker.DocumentPickerAsset): Promise<FileData> => {
  const base64 = await getFileContentBase64(asset);
  const zip = await JSZip.loadAsync(base64, { base64: true });
  
  const allCsv = Object.keys(zip.files).find(name => name.endsWith('_all.csv'));
  const normalCsv = Object.keys(zip.files).find(name => name.endsWith('.csv') && !name.includes('_all.csv'));
  const mainCsvName = allCsv || normalCsv;

  if (!mainCsvName) {
    throw new Error("Không tìm thấy file CSV nào trong ZIP.");
  }
  
  const csvContent = await zip.files[mainCsvName].async('string');
  
  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const rawData = parsed.data as Record<string, any>[];
  const columns = parsed.meta.fields || [];
  
  // Giải nén các file ảnh/media ra thư mục gốc
  const mediaKeys = Object.keys(zip.files).filter(name => /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(name));
  const extractedPaths: Record<string, string> = {};
  
  // Lấy thông tin user (để tạo đường dẫn upload chuẩn xác)
  let userId = 'anonymous';
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user) userId = data.user.id;
  } catch (e) {}

  // Kỹ thuật Batching: Xử lý ĐỒNG THỜI từng cụm 5 ảnh để cân bằng Tốc độ và RAM
  const BATCH_SIZE = 5;
  for (let i = 0; i < mediaKeys.length; i += BATCH_SIZE) {
    const batch = mediaKeys.slice(i, i + BATCH_SIZE);
    
    const uploadPromises = batch.map(async (key) => {
      try {
        const safeName = key.split('/').pop() || key;
        
        if (Platform.OS === 'web') {
          const ext = safeName.split('.').pop()?.toLowerCase();
          let mime = 'image/jpeg';
          if (ext === 'png') mime = 'image/png';
          if (ext === 'gif') mime = 'image/gif';
          if (ext === 'webp') mime = 'image/webp';
          
          // Đọc ảnh dưới dạng nhị phân nguyên thủy (ArrayBuffer)
          const arrayBuffer = await zip.files[key].async('arraybuffer');
          
          // Tránh trùng tên bằng timestamp và loại bỏ dấu cách để tránh lỗi URI khi hiển thị
          const fileName = `${userId}/${Date.now()}_${safeName.replace(/\s+/g, '_')}`;
          
          // Upload thẳng lên Supabase
          const { error: uploadError } = await supabase.storage
            .from('journals')
            .upload(fileName, arrayBuffer, {
              contentType: mime,
              upsert: false
            });
            
          if (uploadError) {
            console.error("Lỗi upload ảnh ZIP:", uploadError);
            return; // Bỏ qua ảnh này nếu lỗi
          }

          // Lấy link công khai
          const { data: publicUrlData } = supabase.storage
            .from('journals')
            .getPublicUrl(fileName);
            
          // Lưu link HTTP thẳng vào cơ sở dữ liệu (tốn vài byte)
          extractedPaths[safeName] = publicUrlData.publicUrl;
        } else {
          const base64Data = await zip.files[key].async('base64');
          const fileUri = ((FileSystem as any).documentDirectory || '') + 'notion_img_' + safeName;
          await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
          extractedPaths[safeName] = fileUri;
        }
      } catch (e) {
        console.log('Lỗi giải nén ảnh:', key);
      }
    });

    await Promise.all(uploadPromises);
  }

  for (let row of rawData) {
    const title = row['Name'] || row['Title'] || row[columns[0]];
    if (title) {
      const mdFileKeys = Object.keys(zip.files).filter(name => name.endsWith('.md') && name.startsWith(title));
      if (mdFileKeys.length > 0) {
        const mdContent = await zip.files[mdFileKeys[0]].async('string');
        row['_markdown_content'] = mdContent;
      }
    }

    // Replace filenames in media columns with the actual local file URIs
    for (const col of columns) {
      if (row[col] && typeof row[col] === 'string') {
        const parts = row[col].split(',').map((p: string) => p.trim());
        const mappedParts = parts.map((p: string) => {
          // Notion có thể xuất đường dẫn chứa thư mục hoặc chỉ tên file (đôi khi bị mã hóa URL như %20)
          let basename = p.split('/').pop() || p;
          try {
            basename = decodeURIComponent(basename);
          } catch (e) {}
          
          return extractedPaths[basename] || p;
        });
        row[col] = mappedParts.join(',');
      }
    }
  }
  
  if (!columns.includes('_markdown_content') && rawData.some(r => r['_markdown_content'])) {
    columns.push('_markdown_content');
  }

  return {
    columns,
    data: rawData,
    fileName: asset.name,
  };
};

export const exportDataToFile = async (data: any[], fileName: string, format: 'csv' | 'xlsx') => {
  if (data.length === 0) {
    throw new Error("Không có dữ liệu để xuất");
  }

  let fileUri = ((FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '') + fileName;
  
  if (format === 'csv') {
    fileUri += '.csv';
    const csvContent = Papa.unparse(data);
    await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
  } else {
    fileUri += '.xlsx';
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  }

  if (Platform.OS === 'web') {
    const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    const link = document.createElement('a');
    link.href = `data:${format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};base64,${content}`;
    link.download = fileName + '.' + format;
    link.click();
  } else {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Tính năng chia sẻ không khả dụng trên thiết bị này");
    }
    await Sharing.shareAsync(fileUri);
  }
};
