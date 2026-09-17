import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { FileData } from '../services/importExport';
import { addJournal } from '../database/journals';
import { addActivity } from '../database/activities';
import { addHabit } from '../database/habits';
import { addEnglishNote } from '../database/english';
import { useUserStore } from '../store';

interface Props {
  visible: boolean;
  fileData: FileData | null;
  onClose: () => void;
  onSuccess: () => void;
}

type TableType = 'journals' | 'activities' | 'habits' | 'english_notes';

const TABLE_FIELDS: Record<TableType, { key: string; label: string; required?: boolean }[]> = {
  journals: [
    { key: 'day_sequence', label: 'Tiêu đề / Ngày thứ', required: true },
    { key: 'entry_date', label: 'Ngày tạo (ISO/Date)', required: true },
    { key: 'content', label: 'Nội dung' },
    { key: 'mood', label: 'Tâm trạng / Cảm xúc' },
    { key: 'images', label: 'Hình ảnh (Link/Tên file)' },
  ],
  activities: [
    { key: 'title', label: 'Tên công việc', required: true },
    { key: 'start_date', label: 'Ngày bắt đầu' },
    { key: 'deadline', label: 'Hạn chót' },
    { key: 'category', label: 'Danh mục' },
    { key: 'priority', label: 'Mức độ ưu tiên' },
    { key: 'location', label: 'Địa điểm' },
    { key: 'notes', label: 'Ghi chú' },
  ],
  habits: [
    { key: 'name', label: 'Tên thói quen', required: true },
    { key: 'icon', label: 'Icon (Emoji)' },
    { key: 'color', label: 'Màu sắc (Hex)' },
  ],
  english_notes: [
    { key: 'type', label: 'Loại (tip / flashcard)', required: true },
    { key: 'title_or_word', label: 'Từ vựng / Tiêu đề', required: true },
    { key: 'content_or_meaning', label: 'Nghĩa / Nội dung' },
    { key: 'example_sentence', label: 'Câu ví dụ' },
  ],
};

export default function ImportMappingModal({ visible, fileData, onClose, onSuccess }: Props) {
  const { user } = useUserStore();
  const [selectedTable, setSelectedTable] = useState<TableType>('journals');
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!fileData || !user) return null;

  const handleImport = async () => {
    try {
      const fields = TABLE_FIELDS[selectedTable];
      
      // Kiểm tra các trường bắt buộc
      for (const field of fields) {
        if (field.required && !mapping[field.key]) {
          setStatusMsg(`Lỗi: Vui lòng chọn cột cho trường bắt buộc: ${field.label}`);
          return;
        }
      }

      setIsProcessing(true);
      setStatusMsg('');

      // Trả lại luồng cho UI render trạng thái loading
      await new Promise(resolve => setTimeout(resolve, 100));

      let importedCount = 0;

      for (const row of fileData.data) {
        // Nhường luồng cho UI sau mỗi dòng để tránh đơ app
        await new Promise(resolve => setTimeout(resolve, 0));

        const getVal = (key: string) => {
          const mappedCol = mapping[key];
          if (!mappedCol) return undefined;
          // _markdown_content là field đặc biệt sinh ra từ file ZIP
          if (mappedCol === '_markdown_content') return row['_markdown_content'] || '';
          return row[mappedCol];
        };

        if (selectedTable === 'journals') {
          const entryDate = getVal('entry_date');
          const daySequence = getVal('day_sequence');
          if (!entryDate || !daySequence) continue;
                    addJournal({
              userId: user.id,
              entryDate: new Date(entryDate).toISOString(),
              daySequence: daySequence,
              content: getVal('content'),
              mood: getVal('mood'),
              images: getVal('images') ? getVal('images').split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
            });
          importedCount++;
        } else if (selectedTable === 'activities') {
          const title = getVal('title');
          if (!title) continue;
          
          addActivity({
            userId: user.id,
            title,
            startDate: getVal('start_date') ? new Date(getVal('start_date')).toISOString() : undefined,
            deadline: getVal('deadline') ? new Date(getVal('deadline')).toISOString() : undefined,
            category: getVal('category'),
            priority: getVal('priority'),
            location: getVal('location'),
            notes: getVal('notes'),
          });
          importedCount++;
        } else if (selectedTable === 'habits') {
          const name = getVal('name');
          if (!name) continue;
          addHabit({
            userId: user.id,
            name,
            icon: getVal('icon') || '✨',
            color: getVal('color') || '#ffffff',
          });
          importedCount++;
        } else if (selectedTable === 'english_notes') {
          const titleOrWord = getVal('title_or_word');
          const type = getVal('type')?.toLowerCase();
          if (!titleOrWord || (type !== 'tip' && type !== 'flashcard')) continue;
          
          addEnglishNote({
            userId: user.id,
            type: type as any,
            titleOrWord,
            contentOrMeaning: getVal('content_or_meaning'),
            exampleSentence: getVal('example_sentence'),
          });
          importedCount++;
        }
      }
          
      setStatusMsg(`Thành công! Đã nhập ${importedCount} dòng dữ liệu.`);
      setIsProcessing(false);
      
      // Đợi 1.5s rồi đóng Modal
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (innerError: any) {
      setIsProcessing(false);
      setStatusMsg("Lỗi: " + (innerError.message || "Định dạng ngày tháng sai"));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-notion-bg p-4 pt-10">
        <Text className="text-notion-text font-mono-bold text-lg mb-2">Nhập dữ liệu</Text>
        <Text className="text-notion-muted font-mono text-xs mb-4">File: {fileData.fileName}</Text>
        
        {statusMsg ? (
          <View className={`mb-4 p-3 rounded-md border ${statusMsg.includes('Lỗi') ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
            <Text className={`font-mono text-sm ${statusMsg.includes('Lỗi') ? 'text-red-500' : 'text-green-500'}`}>{statusMsg}</Text>
          </View>
        ) : null}

        <Text className="text-notion-text font-mono-bold mb-2">1. Chọn bảng dữ liệu</Text>
        <ScrollView horizontal className="mb-6 flex-row max-h-12" showsHorizontalScrollIndicator={false}>
          {Object.keys(TABLE_FIELDS).map(t => (
            <TouchableOpacity 
              key={t}
              onPress={() => { setSelectedTable(t as TableType); setMapping({}); }}
              className={`px-4 py-2 rounded-md mr-2 border ${selectedTable === t ? 'bg-notion-text border-notion-text' : 'bg-notion-card border-notion-border'}`}
            >
              <Text className={`font-mono ${selectedTable === t ? 'text-notion-bg' : 'text-notion-text'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text className="text-notion-text font-mono-bold mb-2">2. Gán cột dữ liệu (Mapping)</Text>
        <Text className="text-notion-muted font-mono text-xs mb-4">
          Ghép nối "Trường dữ liệu của Ứng dụng" với "Cột trong File của bạn". Kéo sang ngang để xem thêm cột.
        </Text>
        
        <ScrollView className="flex-1 mb-4">
          {TABLE_FIELDS[selectedTable].map(field => (
            <View key={field.key} className="mb-4 bg-notion-card p-3 rounded-md border border-notion-border">
              <Text className="text-notion-text font-mono-bold text-sm mb-2">
                Trường App: {field.label} {field.required && <Text className="text-red-500">*</Text>}
              </Text>
              
              <Text className="text-notion-muted font-mono text-xs mb-1">Chọn cột từ File tương ứng:</Text>
              
              <ScrollView horizontal className="flex-row">
                <TouchableOpacity 
                  onPress={() => setMapping(prev => ({ ...prev, [field.key]: '' }))}
                  className={`px-3 py-1 mr-2 border rounded-full ${!mapping[field.key] ? 'bg-blue-500 border-blue-500' : 'bg-notion-card border-notion-border'}`}
                >
                  <Text className={`font-mono text-xs ${!mapping[field.key] ? 'text-white' : 'text-notion-text'}`}>[Bỏ trống]</Text>
                </TouchableOpacity>

                {fileData.columns.map(col => (
                  <TouchableOpacity 
                    key={col}
                    onPress={() => setMapping(prev => ({ ...prev, [field.key]: col }))}
                    className={`px-3 py-1 mr-2 border rounded-full ${mapping[field.key] === col ? 'bg-blue-500 border-blue-500' : 'bg-notion-card border-notion-border'}`}
                  >
                    <Text className={`font-mono text-xs ${mapping[field.key] === col ? 'text-white' : 'text-notion-text'}`}>
                      {col === '_markdown_content' ? 'Nội dung chi tiết trang Notion (Từ ZIP)' : col}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        <View className="flex-row justify-between pt-4 border-t border-notion-border">
          <TouchableOpacity 
            onPress={onClose} 
            disabled={isProcessing}
            className={`bg-notion-card border border-notion-border py-3 px-6 rounded-md ${isProcessing ? 'opacity-50' : ''}`}
          >
            <Text className="text-notion-text font-mono-bold">Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleImport} 
            disabled={isProcessing}
            className={`bg-notion-text flex-row items-center justify-center py-3 px-6 rounded-md ${isProcessing ? 'opacity-70' : ''}`}
          >
            {isProcessing && <ActivityIndicator size="small" color="#ffffff" className="mr-2" />}
            <Text className="text-notion-bg font-mono-bold">
              {isProcessing ? 'Đang xử lý...' : 'Thực hiện Nhập'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
