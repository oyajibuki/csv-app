import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle2, X, RotateCcw, Filter, Sparkles, ChevronDown, ArrowLeft, ArrowRight, EyeOff, Trash2 } from 'lucide-react';

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

// === メインコンポーネント ===

const CSVFormatter = () => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [columnSettings, setColumnSettings] = useState([]); // { index, name, visible, type }
  // type: 'text', 'number', 'postal', 'phone'
  const [history, setHistory] = useState([]);
  const [isCleaned, setIsCleaned] = useState(false);
  const [filterConfig, setFilterConfig] = useState({ column: '', text: '' });
  const [errors, setErrors] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState('');

  // ヘッダーメニュー用
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 履歴保存
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

  // ファイルアップロード
  const handleFileUpload = useCallback((e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      let { headers: parsedHeaders, rows: parsedRows } = parseCSV(text);

      // 自動削除: 全行で空の末尾列を削除
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

      // 大量データの警告
      if (parsedRows.length > 30000) {
        if (!window.confirm(`${parsedRows.length.toLocaleString()}行のデータです。続行しますか？`)) return;
      }

      setFile(uploadedFile);
      setHeaders(parsedHeaders);
      setRows(parsedRows);

      // 初期設定: 全列visible, typeはデフォルトでtext
      setColumnSettings(parsedHeaders.map((h, i) => ({
        index: i,
        name: h,
        visible: true,
        type: 'text' // default
      })));

      setHistory([]);
      setErrors([]);
      setIsCleaned(false);
    };
    reader.readAsText(uploadedFile);
  }, []);

  // データクレンジング
  const handleDataCleaning = () => {
    saveToHistory('データクレンジング');

    // 設定されたtypeに基づいてクレンジング
    const cleanedRows = rows.map(row =>
      row.map((cell, originalColIndex) => {
        // 現在の列設定を取得 (移動されている可能性があるため)
        const setting = columnSettings.find(c => c.index === originalColIndex);
        if (!setting) return cell;

        if (!cell) return cell;
        let result = String(cell);

        // 共通処理
        // 1. 半角カタカナ→全角
        result = hankakuToZenkakuKatakana(result);
        // 2. 全角スペース→半角
        result = result.replace(/　/g, ' ');

        // === タイプ別処理 ===
        if (setting.type === 'number') {
          // 数値・金額: アルファベットと記号(.,-以外)を削除
          const numStr = result.replace(/[^\d.-]/g, '');
          if (numStr && !isNaN(numStr)) {
            // カンマ区切りフォーマット
            result = Number(numStr).toLocaleString();
          } else {
            result = ''; // 数値として認識できない場合は空にするか、元のままにするか(ここでは空)
          }
        } else if (setting.type === 'postal') {
          // 郵便番号: 数字とハイフン以外削除（アルファベット除去）
          const postalNums = result.replace(/[^\d]/g, '');
          if (postalNums.length === 7) {
            result = `${postalNums.slice(0, 3)}-${postalNums.slice(3)}`;
          } else if (postalNums.length === 6) { // まれなケース
            result = `${postalNums.slice(0, 3)}-${postalNums.slice(3)}`;
          } else {
            result = postalNums; // 桁数合わない場合は数字のみ残す
          }
        } else {
          // text, phoneなど
          // #削除 (全タイプ共通またはテキストのみ)
          result = result.replace(/#/g, '');

          // 既存のロジック: 英数字統一、カタカナ統一、都道府県統一など
          if (setting.type === 'phone') {
            const nums = result.replace(/[^\d]/g, '');
            if (nums.length === 11) {
              result = `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
            } else if (nums.length === 10) {
              result = `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`;
            }
          } else {
            // 通常テキスト
            // 全角英数字→半角
            result = result.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            // 都道府県・市区町村正規化
            Object.entries(PREFECTURE_MAP).forEach(([k, v]) => { if (result.includes(k)) result = result.replace(k, v); });
            Object.entries(CITY_MAP).forEach(([k, v]) => { if (result.includes(k)) result = result.replace(k, v); });
          }
        }

        // ゴミ掃除（全タイプ、制御文字など）
        result = result.replace(/[\x00-\x1F\x7F]/g, "");

        return result;
      })
    );

    setRows(cleanedRows);
    setIsCleaned(true);
  };

  // 列操作
  const updateColumnType = (index, type) => {
    setColumnSettings(prev => prev.map((col, i) => i === index ? { ...col, type } : col));
    setActiveMenuIndex(null);
  };

  const hideColumn = (index) => {
    setColumnSettings(prev => prev.map((col, i) => i === index ? { ...col, visible: false } : col));
    setActiveMenuIndex(null);
  };

  const moveColumn = (currentIndex, direction) => {
    const newSettings = [...columnSettings];
    // 表示されている列の中でのインデックス移動が必要
    // ここでは簡易的に配列内の移動を行う
    if (direction === 'left' && currentIndex > 0) {
      [newSettings[currentIndex], newSettings[currentIndex - 1]] = [newSettings[currentIndex - 1], newSettings[currentIndex]];
    } else if (direction === 'right' && currentIndex < newSettings.length - 1) {
      [newSettings[currentIndex], newSettings[currentIndex + 1]] = [newSettings[currentIndex + 1], newSettings[currentIndex]];
    }
    setColumnSettings(newSettings);
  };

  // フィルタリング
  const filteredRows = useMemo(() => {
    if (!filterConfig.column || !filterConfig.text) return rows;
    const colIndex = headers.indexOf(filterConfig.column); // 元のヘッダーインデックス
    if (colIndex === -1) return rows;
    return rows.filter(row => String(row[colIndex] || '').includes(filterConfig.text));
  }, [rows, headers, filterConfig]);

  // ダウンロード
  const handleDownload = () => {
    try {
      setDownloadStatus('処理中...');
      const visibleCols = columnSettings.filter(c => c.visible);
      // columnSettingsの順番に従ってデータを作成
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
    }
  };

  // 表示用
  const visibleColumns = columnSettings.filter(c => c.visible);
  const previewRows = filteredRows.slice(0, 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ヘッダー */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">CSV Formatter Pro</h1>
            <p className="text-slate-500">インテリジェントなデータ整形・加工ツール</p>
          </div>
          {file && (
            <div className="text-right">
              <p className="font-semibold text-slate-700">{file.name}</p>
              <p className="text-sm text-slate-400">{rows.length.toLocaleString()} rows</p>
            </div>
          )}
        </div>

        {!file ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-16 text-center hover:border-blue-400 transition-colors group">
            <Upload className="w-16 h-16 mx-auto mb-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
            <h2 className="text-2xl font-bold text-slate-700 mb-4">CSVファイルをここにドロップ</h2>
            <label className="inline-block">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                またはファイルを選択
              </div>
            </label>
            <p className="mt-4 text-slate-400 text-sm">推奨: 3万行以下のCSVファイル</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* メインアクションエリア */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* 1. クレンジング */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    データクレンジング
                  </h3>
                  {isCleaned && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">完了</span>}
                </div>
                <div className="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-lg">
                  <p>列の「タイプ」に合わせて最適な整形を行います。</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                    <li><span className="font-semibold text-slate-700">数値・金額</span>: カンマ区切り、円マークなどの文字削除</li>
                    <li><span className="font-semibold text-slate-700">郵便番号</span>: "abc"等の文字削除、ハイフン付与</li>
                    <li><span className="font-semibold text-slate-700">テキスト</span>: 半角カナ→全角、記号(#)削除など</li>
                  </ul>
                </div>
                <button
                  onClick={handleDataCleaning}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  クレンジング実行
                </button>
                <div className="mt-4 flex gap-2 justify-end">
                  {history.length > 0 && (
                    <button onClick={handleUndo} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> 元に戻す
                    </button>
                  )}
                  <button onClick={() => window.location.reload()} className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1 ml-4">
                    <Trash2 className="w-3 h-3" /> リセット
                  </button>
                </div>
              </div>

              {/* 2. 出力 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Download className="w-5 h-5 text-blue-500" />
                  ダウンロード
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  現在表示されている列 (`{visibleColumns.length}`列) と絞り込み結果 (`{filteredRows.length}`行) をCSVで出力します。
                </p>
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition"
                >
                  {downloadStatus || 'CSV ダウンロード'}
                </button>
              </div>
            </div>

            {/* プレビュー & 列操作 */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">プレビュー & 列編集</h3>
                <div className="flex gap-2">
                  {/* 簡易フィルタ */}
                  <div className="relative">
                    <Filter className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="データを検索..."
                      className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                      value={filterConfig.text}
                      onChange={e => setFilterConfig({ column: headers[0], text: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto relative">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 sticky top-0 z-10 shadow-sm">
                      {columnSettings.filter(c => c.visible).map((col, viewIndex) => (
                        <th key={col.index} className="border-b border-r border-slate-200 min-w-[150px] p-0 relative group">
                          <div
                            className="p-3 pr-8 cursor-pointer hover:bg-slate-200 transition select-none"
                            onClick={() => setActiveMenuIndex(activeMenuIndex === col.index ? null : col.index)}
                          >
                            <div className="font-bold text-slate-800">{col.name}</div>
                            <div className="text-xs text-slate-500 mt-1 font-mono uppercase bg-slate-200/50 inline-block px-1 rounded">
                              {col.type}
                            </div>
                            <ChevronDown className="w-4 h-4 absolute right-2 top-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                          </div>

                          {/* Dropdown Menu */}
                          {activeMenuIndex === col.index && (
                            <div ref={menuRef} className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                              <div className="p-2 border-b border-slate-100">
                                <div className="text-xs font-semibold text-slate-400 mb-1 px-2">列のタイプ</div>
                                <button onClick={() => updateColumnType(col.index, 'text')} className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 ${col.type === 'text' ? 'text-blue-600 font-bold' : ''}`}>Text (標準)</button>
                                <button onClick={() => updateColumnType(col.index, 'number')} className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 ${col.type === 'number' ? 'text-blue-600 font-bold' : ''}`}>Number (金額)</button>
                                <button onClick={() => updateColumnType(col.index, 'postal')} className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 ${col.type === 'postal' ? 'text-blue-600 font-bold' : ''}`}>Postal (郵便番号)</button>
                                <button onClick={() => updateColumnType(col.index, 'phone')} className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-blue-50 ${col.type === 'phone' ? 'text-blue-600 font-bold' : ''}`}>Phone (電話)</button>
                              </div>
                              <div className="p-2 border-b border-slate-100">
                                <div className="text-xs font-semibold text-slate-400 mb-1 px-2">列の移動</div>
                                <div className="flex gap-1">
                                  <button onClick={() => moveColumn(viewIndex, 'left')} className="flex-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-center"><ArrowLeft className="w-3 h-3 mx-auto" /></button>
                                  <button onClick={() => moveColumn(viewIndex, 'right')} className="flex-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-center"><ArrowRight className="w-3 h-3 mx-auto" /></button>
                                </div>
                              </div>
                              <div className="p-2">
                                <button onClick={() => hideColumn(col.index)} className="w-full text-left px-2 py-1.5 rounded text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <EyeOff className="w-3 h-3" /> この列を隠す
                                </button>
                              </div>
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-slate-100 hover:bg-blue-50/30 transition">
                        {columnSettings.filter(c => c.visible).map((col) => (
                          <td key={col.index} className="p-3 border-r border-slate-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">{row[col.index] || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CSVFormatter;
