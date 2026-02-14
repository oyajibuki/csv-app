import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Upload, Download, AlertCircle, X, RotateCcw, Filter, Sparkles, ChevronDown, ArrowLeft, ArrowRight, EyeOff, Trash2, GripVertical, GripHorizontal, Plus, Merge, Search, Loader2, RefreshCcw } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// === 定数・マッピング ===
const PREFECTURE_MAP = {
  'ﾎｯｶｲﾄﾞｳ': '北海道', 'ホッカイドウ': '北海道', 'ほっかいどう': '北海道',
  'ｱｵﾓﾘｹﾝ': '青森県', 'アオモリケン': '青森県', 'あおもりけん': '青森県',
  'ｲﾜﾃｹﾝ': '岩手県', 'イワテケン': '岩手県', 'いわてけん': '岩手県',
  'ﾐﾔｷﾞｹﾝ': '宮城県', 'ミヤギケン': '宮城県', 'みやぎけん': '宮城県',
  'ｱｷﾀｹﾝ': '秋田県', 'アキタケン': '秋田県', 'あきたけん': '秋田県',
  'ﾔﾏｶﾞﾀｹﾝ': '山形県', 'ヤマガタケン': '山形県', 'やまがたけん': '山形県',
  'ﾌｸｼﾏｹﾝ': '福島県', 'フクシマケン': '福島県', 'ふくしまけん': '福島県',
  'ｲﾊﾞﾗｷｹﾝ': '茨城県', 'イバラキケン': '茨城県', 'いばらきけん': '茨城県',
  'ﾄﾁｷﾞｹﾝ': '栃木県', 'トチギケン': '栃木県', 'とちぎけん': '栃木県',
  'ｸﾞﾝﾏｹﾝ': '群馬県', 'グンマケン': '群馬県', 'ぐんまけん': '群馬県',
  'ｻｲﾀﾏｹﾝ': '埼玉県', 'サイタマケン': '埼玉県', 'さいたまけん': '埼玉県',
  'ﾁﾊﾞｹﾝ': '千葉県', 'チバケン': '千葉県', 'ちばけん': '千葉県',
  'ﾄｳｷｮｳﾄ': '東京都', 'トウキョウト': '東京都', 'とうきょうと': '東京都',
  'ｶﾅｶﾞﾜｹﾝ': '神奈川県', 'カナガワケン': '神奈川県', 'かながわけん': '神奈川県',
  'ﾆｲｶﾞﾀｹﾝ': '新潟県', 'ニイガタケン': '新潟県', 'にいがたけん': '新潟県',
  'ﾄﾔﾏｹﾝ': '富山県', 'トヤマケン': '富山県', 'とやまけん': '富山県',
  'ｲｼｶﾜｹﾝ': '石川県', 'イシカワケン': '石川県', 'いしかわけん': '石川県',
  'ﾌｸｲｹﾝ': '福井県', 'フクイケン': '福井県', 'ふくいけん': '福井県',
  'ﾔﾏﾅｼｹﾝ': '山梨県', 'ヤマナシケン': '山梨県', 'やまなしけん': '山梨県',
  'ﾅｶﾞﾉｹﾝ': '長野県', 'ナガノケン': '長野県', 'ながのけん': '長野県',
  'ｷﾞﾌｹﾝ': '岐阜県', 'ギフケン': '岐阜県', 'ぎふけん': '岐阜県',
  'ｼｽﾞｵｶｹﾝ': '静岡県', 'シズオカケン': '静岡県', 'しずおかけん': '静岡県',
  'ｱｲﾁｹﾝ': '愛知県', 'アイチケン': '愛知県', 'あいちけん': '愛知県',
  'ﾐｴｹﾝ': '三重県', 'ミエケン': '三重県', 'みえけん': '三重県',
  'ｼｶﾞｹﾝ': '滋賀県', 'シガケン': '滋賀県', 'しがけん': '滋賀県',
  'ｷｮｳﾄﾌ': '京都府', 'キョウトフ': '京都府', 'きょうとふ': '京都府',
  'ｵｵｻｶﾌ': '大阪府', 'オオサカフ': '大阪府', 'おおさかふ': '大阪府',
  'ﾋｮｳｺﾞｹﾝ': '兵庫県', 'ヒョウゴケン': '兵庫県', 'ひょうごけん': '兵庫県',
  'ﾅﾗｹﾝ': '奈良県', 'ナラケン': '奈良県', 'ならけん': '奈良県',
  'ﾜｶﾔﾏｹﾝ': '和歌山県', 'ワカヤマケン': '和歌山県', 'わかやまけん': '和歌山県',
  'ﾄｯﾄﾘｹﾝ': '鳥取県', 'トットリケン': '鳥取県', 'とっとりけん': '鳥取県',
  'ｼﾏﾈｹﾝ': '島根県', 'シマネケン': '島根県', 'しまねけん': '島根県',
  'ｵｶﾔﾏｹﾝ': '岡山県', 'オカヤマケン': '岡山県', 'おかやまけん': '岡山県',
  'ﾋﾛｼﾏｹﾝ': '広島県', 'ヒロシマケン': '広島県', 'ひろしまけん': '広島県',
  'ﾔﾏｸﾞﾁｹﾝ': '山口県', 'ヤマグチケン': '山口県', 'やまぐちけん': '山口県',
  'ﾄｸｼﾏｹﾝ': '徳島県', 'トクシマケン': '徳島県', 'とくしまけん': '徳島県',
  'ｶｶﾞﾜｹﾝ': '香川県', 'カガワケン': '香川県', 'かがわけん': '香川県',
  'ｴﾋﾒｹﾝ': '愛媛県', 'エヒメケン': '愛媛県', 'えひめけん': '愛媛県',
  'ｺｳﾁｹﾝ': '高知県', 'コウチケン': '高知県', 'こうちけん': '高知県',
  'ﾌｸｵｶｹﾝ': '福岡県', 'フクオカケン': '福岡県', 'ふくおかけん': '福岡県',
  'ｻｶﾞｹﾝ': '佐賀県', 'サガケン': '佐賀県', 'さがけん': '佐賀県',
  'ﾅｶﾞｻｷｹﾝ': '長崎県', 'ナガサキケン': '長崎県', 'ながさきけん': '長崎県',
  'ｸﾏﾓﾄｹﾝ': '熊本県', 'クマモトケン': '熊本県', 'くまもとけん': '熊本県',
  'ｵｵｲﾀｹﾝ': '大分県', 'オオイタケン': '大分県', 'おおいたけん': '大分県',
  'ﾐﾔｻﾞｷｹﾝ': '宮崎県', 'ミヤザキケン': '宮崎県', 'みやざきけん': '宮崎県',
  'ｶｺﾞｼﾏｹﾝ': '鹿児島県', 'カゴシマケン': '鹿児島県', 'かごしまけん': '鹿児島県',
  'ｵｷﾅﾜｹﾝ': '沖縄県', 'オキナワケン': '沖縄県', 'おきなわけん': '沖縄県',
};

const CITY_MAP = {
  'ｼﾝｼﾞｭｸｸ': '新宿区', 'シンジュクク': '新宿区', 'しんじゅくく': '新宿区',
  'ﾁﾖﾀﾞｸ': '千代田区', 'チヨダク': '千代田区', 'ちよだく': '千代田区',
  'ﾁｭｳｵｳｸ': '中央区', 'チュウオウク': '中央区', 'ちゅうおうく': '中央区',
  'ﾐﾅﾄｸ': '港区', 'ミナトク': '港区', 'みなとく': '港区',
  'ﾌﾞﾝｷｮｳｸ': '文京区', 'ブンキョウク': '文京区', 'ぶんきょうく': '文京区',
  'ﾀｲﾄｳｸ': '台東区', 'タイトウク': '台東区', 'たいとうく': '台東区',
  'ｽﾐﾀﾞｸ': '墨田区', 'スミダク': '墨田区', 'すみだく': '墨田区',
  'ｺｳﾄｳｸ': '江東区', 'コウトウク': '江東区', 'こうとうく': '江東区',
  'ｼﾅｶﾞﾜｸ': '品川区', 'シナガワク': '品川区', 'しながわく': '品川区',
  'ﾒｸﾞﾛｸ': '目黒区', 'メグロク': '目黒区', 'めぐろく': '目黒区',
  'ｵｵﾀｸ': '大田区', 'オオタク': '大田区', 'おおたく': '大田区',
  'ｾﾀｶﾞﾔｸ': '世田谷区', 'セタガヤク': '世田谷区', 'せたがやく': '世田谷区',
  'ｼﾌﾞﾔｸ': '渋谷区', 'シブヤク': '渋谷区', 'しぶやく': '渋谷区',
  'ﾅｶﾉｸ': '中野区', 'ナカノク': '中野区', 'なかのく': '中野区',
  'ｽｷﾞﾅﾐｸ': '杉並区', 'スギナミク': '杉並区', 'すぎなみく': '杉並区',
  'ﾄｼﾏｸ': '豊島区', 'トシマク': '豊島区', 'としまく': '豊島区',
  'ｷﾀｸ': '北区', 'キタク': '北区', 'きたく': '北区',
  'ｱﾗｶﾜｸ': '荒川区', 'アラカワク': '荒川区', 'あらかわく': '荒川区',
  'ｲﾀﾊﾞｼｸ': '板橋区', 'イタバシク': '板橋区', 'いたばしく': '板橋区',
  'ﾈﾘﾏｸ': '練馬区', 'ネリマク': '練馬区', 'ねりまく': '練馬区',
  'ｱﾀﾞﾁｸ': '足立区', 'アダチク': '足立区', 'あだちく': '足立区',
  'ｶﾂｼｶｸ': '葛飾区', 'カツシカク': '葛飾区', 'かつしかく': '葛飾区',
  'ｴﾄﾞｶﾞﾜｸ': '江戸川区', 'エドガワク': '江戸川区', 'えどがわく': '江戸川区',
  'ﾖｺﾊﾏｼ': '横浜市', 'ヨコハマシ': '横浜市', 'よこはまし': '横浜市',
  'ｶﾜｻｷｼ': '川崎市', 'カワサキシ': '川崎市', 'かわさきし': '川崎市',
  'ｻｲﾀﾏｼ': 'さいたま市', 'サイタマシ': 'さいたま市', 'さいたまし': 'さいたま市',
  'ﾁﾊﾞｼ': '千葉市', 'チバシ': '千葉市', 'ちばし': '千葉市',
  'ｵｵｻｶｼ': '大阪市', 'オオサカシ': '大阪市', 'おおさかし': '大阪市',
  'ｷｮｳﾄｼ': '京都市', 'キョウトシ': '京都市', 'きょうとし': '京都市',
  'ｺｳﾍﾞｼ': '神戸市', 'コウベシ': '神戸市', 'こうべし': '神戸市',
  'ﾅｺﾞﾔｼ': '名古屋市', 'ナゴヤシ': '名古屋市', 'なごやし': '名古屋市',
  'ﾌｸｵｶｼ': '福岡市', 'フクオカシ': '福岡市', 'ふくおかし': '福岡市',
  'ｻｯﾎﾟﾛｼ': '札幌市', 'サッポロシ': '札幌市', 'さっぽろし': '札幌市',
};

// === ユーティリティ関数 ===
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

const hankakuToZenkakuKatakana = (str) => {
  const hankaku = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯﾞﾟｰ･';
  const zenkaku = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ゛゜ー・';
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = hankaku.indexOf(char);
    if (index !== -1) {
      const nextChar = str[i + 1];
      if (nextChar === 'ﾞ' || nextChar === 'ﾟ') {
        const baseChar = zenkaku[index];
        if (nextChar === 'ﾞ') {
          const dakuten = 'ガギグゲゴザジズゼゾダヂヅデドバビブベボ';
          const dakutenBase = 'カキクケコサシスセソタチツテトハヒフヘホ';
          const dakutenIndex = dakutenBase.indexOf(baseChar);
          result += dakutenIndex !== -1 ? dakuten[dakutenIndex] : baseChar + '゛';
        } else {
          const handakuten = 'パピプペポ';
          const handakutenBase = 'ハヒフヘホ';
          const handakutenIndex = handakutenBase.indexOf(baseChar);
          result += handakutenIndex !== -1 ? handakuten[handakutenIndex] : baseChar + '゜';
        }
        i++;
      } else {
        result += zenkaku[index];
      }
    } else {
      result += char;
    }
  }
  return result;
};

// === DND対応ヘッダーコンポーネント ===
const SortableHeader = ({ col, activeMenuIndex, setActiveMenuIndex, menuRef, updateColumnType, hideColumn }) => {
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
          <div className="text-[10px] text-slate-500 font-mono uppercase bg-slate-200/50 px-1 rounded flex items-center gap-1">
            {col.type} <ChevronDown className="w-3 h-3 ml-1" />
          </div>
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

        {/* 設定メニューボタン (クリックでメニュー) */}
        <div
          className="absolute bottom-1 right-1 p-1 text-slate-400 hover:text-blue-500 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); setActiveMenuIndex(activeMenuIndex === col.index ? null : col.index); }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <GripHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Dropdown Menu */}
      {activeMenuIndex === col.index && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 z-50 text-slate-700 text-left font-normal"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-400 mb-1 px-2">列のタイプ</div>
            <button onClick={() => updateColumnType(col.index, 'text')} className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 ${col.type === 'text' ? 'text-blue-600 font-bold' : ''}`}>Text (標準)</button>
            <button onClick={() => updateColumnType(col.index, 'number')} className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 ${col.type === 'number' ? 'text-blue-600 font-bold' : ''}`}>Number (金額)</button>
            <button onClick={() => updateColumnType(col.index, 'postal')} className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 ${col.type === 'postal' ? 'text-blue-600 font-bold' : ''}`}>Postal (郵便番号)</button>
            <button onClick={() => updateColumnType(col.index, 'phone')} className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 ${col.type === 'phone' ? 'text-blue-600 font-bold' : ''}`}>Phone (電話)</button>
          </div>
          <div className="p-2">
            <button onClick={() => hideColumn(col.index)} className="w-full text-left px-2 py-1.5 rounded text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Trash2 className="w-3 h-3" /> 列を削除
            </button>
          </div>
        </div>
      )}
    </th>
  );
};

// === メインコンポーネント ===
const CSVFormatter = () => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  // 初期データの保持用
  const [initialHeaders, setInitialHeaders] = useState([]);
  const [initialRows, setInitialRows] = useState([]);

  const [columnSettings, setColumnSettings] = useState([]);
  const [history, setHistory] = useState([]);
  const [isCleaned, setIsCleaned] = useState(false);
  const [filterConfig, setFilterConfig] = useState({ columnIndex: '', text: '' });
  const [downloadStatus, setDownloadStatus] = useState('');

  const [splitConfig, setSplitConfig] = useState({ column: '', delimiter: ' ' });
  const [mergeConfig, setMergeConfig] = useState({ columns: [], delimiter: ' ' });

  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const menuRef = useRef(null);

  // ステータス管理
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

        // 初期データを保存
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
    setIsProcessing(true); // ローディング開始

    // setTimeoutでメインスレッドを解放し、ローディング表示を描画させる
    setTimeout(() => {
      try {
        saveToHistory('データクレンジング');
        const cleanedRows = rows.map(row =>
          row.map((cell, originalColIndex) => {
            const setting = columnSettings.find(c => c.index === originalColIndex);
            if (!setting) return cell;
            if (!cell) return cell;
            let result = String(cell);

            result = hankakuToZenkakuKatakana(result);
            result = result.replace(/　/g, ' ');

            if (setting.type === 'number') {
              const numStr = result.replace(/[^\d.-]/g, '');
              if (numStr && !isNaN(numStr)) result = Number(numStr).toLocaleString();
              else result = '';
            } else if (setting.type === 'postal') {
              const postalNums = result.replace(/[^\d]/g, '');
              if (postalNums.length === 7) result = `${postalNums.slice(0, 3)}-${postalNums.slice(3)}`;
              else if (postalNums.length === 6) result = `${postalNums.slice(0, 3)}-${postalNums.slice(3)}`;
              else result = postalNums;
            } else {
              result = result.replace(/#/g, '');
              if (setting.type === 'phone') {
                const nums = result.replace(/[^\d]/g, '');
                if (nums.length === 11) result = `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
                else if (nums.length === 10) result = `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`;
              } else {
                result = result.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
                Object.entries(PREFECTURE_MAP).forEach(([k, v]) => { if (result.includes(k)) result = result.replace(k, v); });
                Object.entries(CITY_MAP).forEach(([k, v]) => { if (result.includes(k)) result = result.replace(k, v); });
              }
            }
            return result.replace(/[\x00-\x1F\x7F]/g, "");
          })
        );
        setRows(cleanedRows);
        setIsCleaned(true);
      } catch (error) {
        console.error("Cleaning failed:", error);
        alert("エラーが発生しました: " + error.message);
      } finally {
        setIsProcessing(false); // ローディング終了
      }
    }, 50);
  };

  const updateColumnType = (index, type) => {
    setColumnSettings(prev => prev.map(c => c.index === index ? { ...c, type } : c));
    setActiveMenuIndex(null);
  };

  const hideColumn = (index) => {
    setColumnSettings(prev => prev.map(c => c.index === index ? { ...c, visible: false } : c));
    setActiveMenuIndex(null);
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
    return rows.filter(row => String(row[idx] || '').includes(filterConfig.text));
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
        </div>
      )}

      {/* ヘッダーエリア */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 shadow-sm z-20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">CSV Formatter Pro</h1>
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
                          activeMenuIndex={activeMenuIndex}
                          setActiveMenuIndex={setActiveMenuIndex}
                          menuRef={menuRef}
                          updateColumnType={updateColumnType}
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

export default CSVFormatter;
