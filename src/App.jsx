import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Upload, Download, AlertCircle, X, RotateCcw, Filter, Sparkles, ChevronDown, ArrowLeft, ArrowRight, EyeOff, Trash2, GripVertical, GripHorizontal, Plus, Merge, Search, Loader2, RefreshCcw, Undo2, CheckCircle2, Users } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// === ユーティリティ関数（最小限） ===
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(v => v.trim());
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
};

const generateCSV = (headers, rows) => {
  const escapeLine = (values) => {
    return values.map(v => {
      const str = String(v || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  };
  return [escapeLine(headers), ...rows.map(row => escapeLine(row))].join('\n');
};

// === Toast コンポーネント (Tailwind Utilityのみ使用) ===
const Toast = ({ message, onUndo, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] transition-all duration-300 ease-out animate-bounce-in">
      <span className="text-sm font-medium">{message}</span>
      {onUndo && (
        <button
          onClick={onUndo}
          className="text-blue-300 hover:text-blue-100 text-sm font-bold bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition flex items-center gap-1"
        >
          <Undo2 className="w-4 h-4" /> 元に戻す
        </button>
      )}
      <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};


// === DND対応ヘッダーコンポーネント ===
const SortableHeader = ({ col, hideColumn }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`border-b border-r border-slate-200 relative group bg-slate-100 min-w-[120px] max-w-[300px] hover:bg-slate-200 transaction select-none whitespace-nowrap align-top`}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col h-full">
        {/* ドラッグハンドル兼コンテンツエリア */}
        <div className="p-3 pr-8 cursor-grab active:cursor-grabbing w-full h-full flex flex-col justify-start items-start gap-1">
          <div className="font-bold text-slate-800 text-sm truncate w-full" title={col.name}>{col.name}</div>
        </div>

        {/* 削除ボタン (常時表示またはホバー) */}
        <button
          className="absolute top-1 right-1 text-slate-400 hover:text-red-500 rounded p-1 hover:bg-red-50"
          onClick={(e) => { e.stopPropagation(); hideColumn(col.index); }}
          title="列を削除 (隠す)"
          onPointerDown={(e) => e.stopPropagation()} // ドラッグ誤爆防止
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </th>
  );
};

// === メインコンポーネント ===
const App = () => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [initialHeaders, setInitialHeaders] = useState([]);
  const [initialRows, setInitialRows] = useState([]);

  const [columnSettings, setColumnSettings] = useState([]);
  const [history, setHistory] = useState([]);
  const [isCleaned, setIsCleaned] = useState(false);
  const [filterConfig, setFilterConfig] = useState({ columnIndex: '', text: '' });
  const [downloadStatus, setDownloadStatus] = useState('');

  const [splitConfig, setSplitConfig] = useState({ column: '', delimiter: ' ' });
  const [mergeConfig, setMergeConfig] = useState({ columns: [], delimiter: ' ' });

  // ステータス・Toast管理
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  // カウンター用のステート
  const [counter, setCounter] = useState(null);

  // カウンター取得のEffect
  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const url = "https://script.google.com/macros/s/AKfycbznxYkj5ixnK_pHkGR8LUYhEYdvSYpaiF3x4LaZy964wlu068oak1X1uuIiyqCEtGWF/exec?page=CSV";
        const response = await fetch(url);
        const data = await response.text();
        setCounter(data);
      } catch (error) {
        console.error("Counter fetch error:", error);
      }
    };
    fetchCounter();
  }, []);

  const saveToHistory = (action) => {
    setHistory(prev => [...prev, {
      action,
      headers: [...headers],
      rows: rows.map(r => [...r]),
      columnSettings: columnSettings.map(c => ({ ...c })),
      timestamp: Date.now()
    }]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHeaders(lastState.headers);
    setRows(lastState.rows);
    setColumnSettings(lastState.columnSettings);
    setHistory(prev => prev.slice(0, -1));
    setToast(null);
  };

  const handleResetToInitial = () => {
    if (!window.confirm('最初のデータ（アップロード直後）の状態に戻しますか？\n※現在の編集内容はすべて破棄されます。')) return;

    setIsProcessing(true);
    setTimeout(() => {
      setHeaders([...initialHeaders]);
      setRows(initialRows.map(r => [...r]));
      setColumnSettings(initialHeaders.map((h, i) => ({
        id: i,
        index: i,
        name: h,
        visible: true,
        type: 'text'
      })));
      setHistory([]);
      setIsCleaned(false);
      setIsProcessing(false);
    }, 10);
  };

  const handleFileUpload = useCallback((e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setIsProcessing(true);
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        let { headers: parsedHeaders, rows: parsedRows } = parseCSV(text);

        while (parsedHeaders.length > 0) {
          const lastIndex = parsedHeaders.length - 1;
          const isHeaderEmpty = !parsedHeaders[lastIndex] || parsedHeaders[lastIndex].trim() === '';
          const isRowsEmpty = parsedRows.every(row => !row[lastIndex] || row[lastIndex].trim() === '');
          if (isHeaderEmpty && isRowsEmpty) {
            parsedHeaders.pop();
            parsedRows = parsedRows.map(row => row.slice(0, -1));
          } else {
            break;
          }
        }

        setFile(uploadedFile);

        setInitialHeaders(parsedHeaders);
        setInitialRows(parsedRows);

        setHeaders(parsedHeaders);
        setRows(parsedRows);
        setColumnSettings(parsedHeaders.map((h, i) => ({
          id: i,
          index: i,
          name: h,
          visible: true,
          type: 'text'
        })));
        setHistory([]);
        setIsCleaned(false);
        setIsProcessing(false);
      };
      reader.readAsText(uploadedFile);
    }, 10);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setColumnSettings((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDataCleaning = () => {
    setIsProcessing(true);
    saveToHistory('データクレンジング');

    // 本来はWorkerを使うが、簡易化のためメインスレッドで処理（指示に基づき既存ロジックを尊重）
    // 注意: worker.jsがない場合はエラーになるため、ここではタイムアウトシミュレーションに留めるか、
    // インライン処理を行います。ここではUI動作を優先。
    setTimeout(() => {
      const cleanedRows = rows.map(row => row.map(cell => {
        if (typeof cell !== 'string') return cell;
        return cell.trim()
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 制御文字削除
          .replace(/\s+/g, ' '); // 重複スペース
      }));
      setRows(cleanedRows);
      setIsCleaned(true);
      setIsProcessing(false);
      setToast({ message: 'データのクレンジングが完了しました', undoAction: handleUndo });
    }, 800);
  };



  const hideColumn = (index) => {
    saveToHistory('列削除');
    setColumnSettings(prev => prev.map(c => c.index === index ? { ...c, visible: false } : c));
    setToast({
      message: '列を削除しました',
      undoAction: handleUndo
    });
  };

  const handleSplitColumn = () => {
    if (!splitConfig.column) return;
    setIsProcessing(true);
    setTimeout(() => {
      saveToHistory('列分割');
      const targetSetting = columnSettings.find(c => c.name === splitConfig.column);
      if (!targetSetting) { setIsProcessing(false); return; }
      const colIndex = targetSetting.index;

      const newRows = rows.map(row => {
        const cellValue = row[colIndex] || '';
        const parts = cellValue.split(splitConfig.delimiter);
        const newRow = [...row];
        newRow[colIndex] = parts[0] || '';
        return [...newRow, parts.slice(1).join(splitConfig.delimiter) || ''];
      });

      const newColName = `${splitConfig.column}_2`;
      const newHeaders = [...headers, newColName];
      const newSettings = [
        ...columnSettings,
        { id: headers.length, index: headers.length, name: newColName, visible: true, type: 'text' }
      ];

      setHeaders(newHeaders);
      setRows(newRows);
      setColumnSettings(newSettings);
      setSplitConfig({ column: '', delimiter: ' ' });
      setIsProcessing(false);
    }, 10);
  };

  const handleMergeColumns = () => {
    if (mergeConfig.columns.length < 2) return;
    setIsProcessing(true);
    setTimeout(() => {
      saveToHistory('列結合');
      const sortedTargetIndices = columnSettings
        .filter(c => mergeConfig.columns.includes(c.name))
        .map(c => c.index);

      const newColumnName = mergeConfig.columns.join('_');
      const newRows = rows.map(row => {
        const mergedValue = sortedTargetIndices
          .map(idx => row[idx] || '')
          .join(mergeConfig.delimiter);
        return [...row, mergedValue];
      });

      const newHeaders = [...headers, newColumnName];
      const newSettings = [
        ...columnSettings,
        { id: headers.length, index: headers.length, name: newColumnName, visible: true, type: 'text' }
      ];

      setHeaders(newHeaders);
      setRows(newRows);
      setColumnSettings(newSettings);
      setMergeConfig({ columns: [], delimiter: ' ' });
      setIsProcessing(false);
    }, 10);
  };

  const filteredRows = useMemo(() => {
    if (filterConfig.columnIndex === '' || !filterConfig.text) return rows;
    const idx = parseInt(filterConfig.columnIndex);
    return rows.filter(row => String(row[idx] || '').toLowerCase().includes(filterConfig.text.toLowerCase()));
  }, [rows, filterConfig]);

  const handleDownload = () => {
    setIsProcessing(true);
    setDownloadStatus('処理中...');
    setTimeout(() => {
      try {
        const visibleCols = columnSettings.filter(c => c.visible);
        const newHeaders = visibleCols.map(c => c.name);
        const newRows = filteredRows.map(row => visibleCols.map(col => row[col.index]));
        const csv = generateCSV(newHeaders, newRows);
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file ? file.name.replace('.csv', '_整形済み.csv') : '整形済み.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        setDownloadStatus('✓ 完了');
        setTimeout(() => setDownloadStatus(''), 3000);
      } catch {
        setDownloadStatus('✗ 失敗');
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const previewRows = filteredRows.slice(0, 50);

  return (
    <div className="h-screen w-full bg-white flex flex-col font-sans text-slate-800 overflow-hidden relative">
      {/* ローディングオーバーレイ */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <div className="text-xl font-bold text-slate-700">処理中...</div>
          <p className="text-slate-500">少々お待ちください</p>
          <p className="text-xs text-slate-400 mt-2">（大量データの場合は時間がかかることがあります）</p>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={() => { toast.undoAction(); setToast(null); }}
          onClose={() => setToast(null)}
        />
      )}

      {/* ヘッダーエリア */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 shadow-sm z-20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">CSV Formatter Pro</h1>
            
            {/* 訪問者カウンター表示 */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold tracking-wider uppercase">Views:</span>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {counter !== null ? Number(counter).toLocaleString() : '---'}
              </span>
            </div>

            {file && (
              <div className="flex items-center gap-3 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{file.name}</span>
                <span>全 {rows.length.toLocaleString()} 行</span>
              </div>
            )}
          </div>
          {file && (
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button onClick={handleUndo} className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 text-xs font-medium text-slate-600 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> 元に戻す
                </button>
              )}

              {/* 最初のデータに戻す */}
              <button onClick={handleResetToInitial} className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded hover:bg-slate-100 text-xs font-medium text-slate-600 flex items-center gap-1">
                <RefreshCcw className="w-3 h-3" /> 最初に戻す
              </button>

              {/* 完全リセット */}
              <button onClick={() => window.location.reload()} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-xs font-medium text-red-600 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> リセット
              </button>
            </div>
          )}
        </div>

        {/* ツールバー */}
        {file && (
          <div className="flex flex-wrap items-center gap-4">
            {/* クレンジング */}
            <button
              onClick={handleDataCleaning}
              disabled={isProcessing}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded font-bold shadow hover:shadow-md transition text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> クレンジング実行
              {isCleaned && <CheckCircle2 className="w-4 h-4" />}
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            {/* 列編集ツール */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
              {/* 分割 */}
              <div className="flex items-center gap-1 px-2">
                <select
                  className="text-xs p-1.5 rounded border border-slate-300 w-28"
                  value={splitConfig.column}
                  onChange={e => setSplitConfig(prev => ({ ...prev, column: e.target.value }))}
                >
                  <option value="">分割する列...</option>
                  {columnSettings.filter(c => c.visible).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="区切り文字"
                  className="w-16 text-xs p-1.5 rounded border border-slate-300"
                  value={splitConfig.delimiter}
                  onChange={e => setSplitConfig(prev => ({ ...prev, delimiter: e.target.value }))}
                />
                <button onClick={handleSplitColumn} disabled={!splitConfig.column || isProcessing} className="p-1.5 bg-white border border-slate-300 rounded hover:bg-blue-50 text-blue-600 disabled:opacity-50">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-300 mx-1"></div>

              {/* 結合 */}
              <div className="flex items-center gap-1 px-2">
                <div className="text-xs text-slate-500 mr-1">結合:</div>
                <select
                  className="text-xs p-1.5 rounded border border-slate-300 w-28"
                  onChange={e => {
                    if (!e.target.value) return;
                    const val = e.target.value;
                    setMergeConfig(prev => ({
                      ...prev,
                      columns: prev.columns.includes(val) ? prev.columns : [...prev.columns, val]
                    }));
                  }}
                  value=""
                >
                  <option value="">列を追加...</option>
                  {columnSettings.filter(c => c.visible).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <div className="flex gap-1">
                  {mergeConfig.columns.map(col => (
                    <span key={col} className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded border border-blue-200 flex items-center gap-0.5">
                      {col} <X className="w-2 h-2 cursor-pointer" onClick={() => setMergeConfig(prev => ({ ...prev, columns: prev.columns.filter(c => c !== col) }))} />
                    </span>
                  ))}
                </div>
                <button onClick={handleMergeColumns} disabled={mergeConfig.columns.length < 2 || isProcessing} className="p-1.5 bg-white border border-slate-300 rounded hover:bg-blue-50 text-blue-600 disabled:opacity-50">
                  <Merge className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            {/* 検索 */}
            <div className="flex items-center gap-2">
              <SearchFilter
                headers={headers}
                columnSettings={columnSettings}
                filterConfig={filterConfig}
                setFilterConfig={setFilterConfig}
                totalRows={rows.length}
                filteredCount={filteredRows.length}
              />
            </div>

            <div className="flex-1"></div>

            {/* ダウンロード */}
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="px-6 py-2 bg-green-600 text-white rounded font-bold shadow hover:bg-green-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {downloadStatus || 'CSV ダウンロード'}
            </button>
          </div>
        )}
      </div>

      {/* ファイル未選択時 */}
      {!file && (
        <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-16 text-center hover:border-blue-400 transition-colors shadow-sm max-w-2xl w-full">
            <Upload className="w-20 h-20 mx-auto mb-6 text-slate-300" />
            <h2 className="text-3xl font-bold text-slate-700 mb-4">CSVファイルをドロップ</h2>
            <label className="inline-block">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg cursor-pointer hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                ファイルを選択
              </div>
            </label>
          </div>
        </div>
      )}

      {/* テーブルエリア */}
      {file && (
        <div className="flex-1 overflow-auto bg-slate-100 p-4 w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="bg-white border-collapse w-full shadow-sm table-auto md:table-fixed">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-slate-50">
                  <SortableContext
                    items={columnSettings.map(c => c.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {columnSettings.map((col) => {
                      if (!col.visible) return null;
                      return (
                        <SortableHeader
                          key={col.id}
                          col={col}
                          hideColumn={hideColumn}
                        />
                      );
                    })}
                  </SortableContext>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((row, rowIndex) => ( // 50行制限
                  <tr key={rowIndex} className="hover:bg-blue-50/50">
                    {columnSettings.map((col) => {
                      if (!col.visible) return null;
                      return (
                        <td key={col.id} className="p-3 border-r border-slate-100 text-sm align-top break-words min-w-[150px] max-w-[400px]">
                          {row[col.index] || ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRows.length > 50 && (
              <div className="p-4 text-center text-slate-500 text-sm bg-slate-50 border-t border-slate-200">
                表示: 50行 / 全 {filteredRows.length.toLocaleString()} 行 (ダウンロード時は全データが出力されます)
              </div>
            )}
          </DndContext>
        </div>
      )}
    </div>
  );
};

// 検索フィルターコンポーネント
const SearchFilter = ({ headers, columnSettings, filterConfig, setFilterConfig, totalRows, filteredCount }) => {
  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
      <select
        className="text-xs bg-transparent border-none focus:ring-0 text-slate-600 font-medium py-1 pl-2 pr-6 max-w-[120px]"
        value={filterConfig.columnIndex}
        onChange={e => setFilterConfig(prev => ({ ...prev, columnIndex: e.target.value }))}
      >
        <option value="">(検索対象を選択)</option>
        {columnSettings.filter(c => c.visible).map(c => (
          <option key={c.id} value={c.index}>{c.name}</option>
        ))}
      </select>
      <div className="h-4 w-px bg-slate-300 mx-1"></div>
      <div className="relative">
        <Filter className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
        <input
          type="text"
          placeholder="検索..."
          className="text-xs border-none bg-transparent focus:ring-0 pl-6 py-1 w-32"
          value={filterConfig.text}
          onChange={e => setFilterConfig(prev => ({ ...prev, text: e.target.value }))}
          disabled={filterConfig.columnIndex === ''}
        />
      </div>
      {filterConfig.text && (
        <>
          <div className="h-4 w-px bg-slate-300 mx-1"></div>
          <div className="text-[10px] text-blue-600 px-2 font-medium whitespace-nowrap">
            {filteredCount} / {totalRows}
          </div>
        </>
      )}
      {filterConfig.text && (
        <button onClick={() => setFilterConfig(prev => ({ ...prev, text: '' }))} className="p-1 hover:bg-slate-200 rounded-full ml-1">
          <X className="w-3 h-3 text-slate-400" />
        </button>
      )}
    </div>
  );
};

export default App;
