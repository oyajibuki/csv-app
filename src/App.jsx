import React, { useState, useCallback, useMemo } from 'react';
import { Upload, Download, AlertCircle, CheckCircle2, X, GripVertical, Plus, RotateCcw, Filter, Merge, Sparkles } from 'lucide-react';

// CSV解析
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

// CSV生成
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
  
  return [
    escapeLine(headers),
    ...rows.map(row => escapeLine(row))
  ].join('\n');
};

// 都道府県マッピング
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

// 市区町村マッピング（主要なもののみ）
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

const CSVFormatter = () => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [columnSettings, setColumnSettings] = useState([]);
  const [history, setHistory] = useState([]);
  const [isCleaned, setIsCleaned] = useState(false);
  const [splitConfig, setSplitConfig] = useState({ column: '', delimiter: ' ' });
  const [mergeConfig, setMergeConfig] = useState({ columns: [], delimiter: ' ' });
  const [filterConfig, setFilterConfig] = useState({ column: '', text: '' });
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [errors, setErrors] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState('');

  // 半角カタカナ→全角カタカナ変換
  const hankakuToZenkakuKatakana = (str) => {
    const hankaku = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯﾞﾟｰ･';
    const zenkaku = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ゛゜ー・';
    
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const index = hankaku.indexOf(char);
      if (index !== -1) {
        const nextChar = str[i + 1];
        // 濁点・半濁点の処理
        if (nextChar === 'ﾞ' || nextChar === 'ﾟ') {
          const baseChar = zenkaku[index];
          if (nextChar === 'ﾞ') {
            // 濁点
            const dakuten = 'ガギグゲゴザジズゼゾダヂヅデドバビブベボ';
            const dakutenBase = 'カキクケコサシスセソタチツテトハヒフヘホ';
            const dakutenIndex = dakutenBase.indexOf(baseChar);
            result += dakutenIndex !== -1 ? dakuten[dakutenIndex] : baseChar + '゛';
          } else {
            // 半濁点
            const handakuten = 'パピプペポ';
            const handakutenBase = 'ハヒフヘホ';
            const handakutenIndex = handakutenBase.indexOf(baseChar);
            result += handakutenIndex !== -1 ? handakuten[handakutenIndex] : baseChar + '゜';
          }
          i++; // 濁点・半濁点をスキップ
        } else {
          result += zenkaku[index];
        }
      } else {
        result += char;
      }
    }
    return result;
  };

  // 履歴保存
  const saveToHistory = (action) => {
    setHistory(prev => [...prev, {
      action,
      headers: [...headers],
      rows: rows.map(r => [...r]),
      columnSettings: columnSettings.map(c => ({...c})),
      timestamp: Date.now()
    }]);
  };

  // 元に戻す
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
      const { headers: parsedHeaders, rows: parsedRows } = parseCSV(text);
      
      // 大量データの警告
      if (parsedRows.length > 30000) {
        const confirm = window.confirm(
          `${parsedRows.length.toLocaleString()}行のデータが検出されました。\n\n` +
          `このツールは2-3万行程度を想定しています。\n` +
          `${parsedRows.length.toLocaleString()}行の処理は動作が重くなる可能性があります。\n\n` +
          `続行しますか？`
        );
        if (!confirm) return;
      }
      
      setFile(uploadedFile);
      setHeaders(parsedHeaders);
      setRows(parsedRows);
      setColumnSettings(parsedHeaders.map((h, i) => ({
        index: i,
        name: h,
        visible: true
      })));
      setHistory([]);
      setErrors([]);
      setIsCleaned(false);
    };
    reader.readAsText(uploadedFile);
  }, []);

  // データクレンジング実行（強化版）
  const handleDataCleaning = () => {
    saveToHistory('データクレンジング');
    
    const cleanedRows = rows.map(row => 
      row.map(cell => {
        if (!cell) return cell;
        let result = String(cell);

        // 1. 半角カタカナ→全角カタカナ
        result = hankakuToZenkakuKatakana(result);

        // 2. 全角スペース→半角スペース
        result = result.replace(/　/g, ' ');

        // 3. 全角英数字→半角英数字
        result = result.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
          return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });

        // 4. ひらがな→カタカナ
        result = result.replace(/[\u3041-\u3096]/g, (s) => {
          return String.fromCharCode(s.charCodeAt(0) + 0x60);
        });

        // 5. 都道府県の正規化
        for (const [key, value] of Object.entries(PREFECTURE_MAP)) {
          if (result.includes(key)) {
            result = result.replace(key, value);
          }
        }

        // 6. 市区町村の正規化
        for (const [key, value] of Object.entries(CITY_MAP)) {
          if (result.includes(key)) {
            result = result.replace(key, value);
          }
        }

        // 7. 電話番号の統一
        // セル内から数字のみを抽出
        const phoneNumbers = result.replace(/[^\d]/g, '');
        
        // 9桁以上11桁以下の数字がある場合、電話番号として処理
        if (phoneNumbers.length >= 9 && phoneNumbers.length <= 11) {
          let formatted = phoneNumbers;
          
          // 9桁または10桁で先頭が90, 80, 70の場合、先頭に0を追加
          if ((formatted.length === 9 || formatted.length === 10) && /^[789]0/.test(formatted)) {
            formatted = '0' + formatted;
          }
          
          // 最終的に11桁の場合
          if (formatted.length === 11) {
            result = `${formatted.slice(0, 3)}-${formatted.slice(3, 7)}-${formatted.slice(7)}`;
          }
          // 10桁の場合
          else if (formatted.length === 10) {
            result = `${formatted.slice(0, 3)}-${formatted.slice(3, 6)}-${formatted.slice(6)}`;
          }
        }

        // 8. 郵便番号の統一（6桁・7桁対応）
        // 電話番号処理されなかった場合のみ実行
        if (!result.match(/^\d{3}-\d{3,4}-\d{4}$/)) {
          const postalNumbers = result.replace(/[^\d]/g, '');
          
          // 6桁または7桁の数字がある場合、郵便番号として処理
          if (postalNumbers.length === 6 || postalNumbers.length === 7) {
            if (postalNumbers.length === 7) {
              result = `${postalNumbers.slice(0, 3)}-${postalNumbers.slice(3)}`;
            } else if (postalNumbers.length === 6) {
              result = `${postalNumbers.slice(0, 3)}-${postalNumbers.slice(3)}`;
            }
          }
        }

        return result;
      })
    );

    setRows(cleanedRows);
    setIsCleaned(true);
  };

  // 列の表示/非表示
  const toggleColumn = (index) => {
    setColumnSettings(prev => prev.map((col, i) => 
      i === index ? { ...col, visible: !col.visible } : col
    ));
  };

  // 列選択トグル（統合用）
  const toggleMergeColumn = (columnName) => {
    setMergeConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(columnName)
        ? prev.columns.filter(c => c !== columnName)
        : [...prev.columns, columnName]
    }));
  };

  // ドラッグ操作
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSettings = [...columnSettings];
    const draggedItem = newSettings[draggedIndex];
    newSettings.splice(draggedIndex, 1);
    newSettings.splice(index, 0, draggedItem);
    
    setColumnSettings(newSettings);
    setDraggedIndex(index);
  };

  // 列分割実行
  const handleSplitColumn = () => {
    if (!splitConfig.column) return;
    
    saveToHistory('列分割');
    
    const colIndex = headers.indexOf(splitConfig.column);
    if (colIndex === -1) return;

    const newRows = rows.map(row => {
      const cellValue = row[colIndex] || '';
      const parts = cellValue.split(splitConfig.delimiter);
      const newRow = [...row];
      newRow[colIndex] = parts[0] || '';
      return [...newRow, parts.slice(1).join(splitConfig.delimiter) || ''];
    });

    const newHeaders = [...headers, `${splitConfig.column}_分割2`];
    const newSettings = [
      ...columnSettings,
      { index: headers.length, name: `${splitConfig.column}_分割2`, visible: true }
    ];

    setHeaders(newHeaders);
    setRows(newRows);
    setColumnSettings(newSettings);
    setSplitConfig({ column: '', delimiter: ' ' });
  };

  // 列統合実行
  const handleMergeColumns = () => {
    if (mergeConfig.columns.length < 2) return;
    
    saveToHistory('列統合');
    
    const colIndices = mergeConfig.columns.map(name => headers.indexOf(name));
    const newColumnName = mergeConfig.columns.join('_統合');

    const newRows = rows.map(row => {
      const mergedValue = colIndices
        .map(idx => row[idx] || '')
        .join(mergeConfig.delimiter);
      
      const newRow = row.filter((_, idx) => !colIndices.includes(idx));
      return [...newRow, mergedValue];
    });

    const newHeaders = headers.filter((_, idx) => !colIndices.includes(idx));
    newHeaders.push(newColumnName);

    const newSettings = columnSettings
      .filter(col => !mergeConfig.columns.includes(col.name))
      .map((col, idx) => ({ ...col, index: idx }));
    newSettings.push({
      index: newHeaders.length - 1,
      name: newColumnName,
      visible: true
    });

    setHeaders(newHeaders);
    setRows(newRows);
    setColumnSettings(newSettings);
    setMergeConfig({ columns: [], delimiter: ' ' });
  };

  // フィルタリング
  const filteredRows = useMemo(() => {
    if (!filterConfig.column || !filterConfig.text) {
      return rows;
    }

    const colIndex = headers.indexOf(filterConfig.column);
    if (colIndex === -1) return rows;

    return rows.filter(row => {
      const value = String(row[colIndex] || '');
      return value.includes(filterConfig.text);
    });
  }, [rows, headers, filterConfig]);

  // エラーチェック
  const checkErrors = useCallback(() => {
    const newErrors = [];
    const visibleColumns = columnSettings.filter(c => c.visible);

    filteredRows.forEach((row, rowIndex) => {
      visibleColumns.forEach((col) => {
        const value = row[col.index];
        
        if (!value || String(value).trim() === '') {
          newErrors.push({
            row: rowIndex,
            col: col.index,
            type: 'empty',
            message: '空白'
          });
        }
      });
    });

    setErrors(newErrors);
  }, [filteredRows, columnSettings]);

  const hasError = (rowIndex, colIndex) => {
    return errors.some(e => e.row === rowIndex && e.col === colIndex);
  };

  // ダウンロード
  const handleDownload = () => {
    try {
      setDownloadStatus('処理中...');
      
      const visibleColumns = columnSettings.filter(c => c.visible);
      const newHeaders = visibleColumns.map(c => c.name);
      const newRows = filteredRows.map(row => 
        visibleColumns.map(col => row[col.index])
      );

      const csv = generateCSV(newHeaders, newRows);
      
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file ? file.name.replace('.csv', '_整形済み.csv') : '整形済み.csv';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      setDownloadStatus('✓ ダウンロード完了');
      setTimeout(() => setDownloadStatus(''), 3000);
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('✗ ダウンロード失敗');
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  const visibleColumns = columnSettings.filter(c => c.visible);
  const previewRows = filteredRows.slice(0, 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">CSV整形ツール</h1>
          <p className="text-gray-600">クリーンにして、整えて、ダウンロード</p>
        </div>

        {!file && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-semibold mb-4">CSVファイルをアップロード</h2>
            <label className="inline-block">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="px-8 py-4 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition">
                ファイルを選択
              </div>
            </label>
            <p className="mt-4 text-sm text-gray-500">
              推奨: 2〜3万行程度のCSVファイル（それ以上は動作が重くなる可能性があります）
            </p>
          </div>
        )}

        {file && (
          <div className="space-y-6">
            {/* ファイル情報 */}
            <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    元データ: {rows.length}行 × {headers.length}列
                    {filterConfig.text && ` → 絞り込み後: ${filteredRows.length}行`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {history.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    元に戻す ({history.length})
                  </button>
                )}
                <button
                  onClick={() => {
                    setFile(null);
                    setHeaders([]);
                    setRows([]);
                    setColumnSettings([]);
                    setHistory([]);
                    setErrors([]);
                    setIsCleaned(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ① データクレンジング */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">① データクレンジング</h3>
                </div>
                {isCleaned && (
                  <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold">
                    ✓ 実行済み
                  </span>
                )}
              </div>
              
              <div className="mb-6 space-y-2 bg-white/10 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">以下をまとめて実行:</p>
                <p>• 半角カタカナ→全角カタカナ: 「ﾔマダﾀﾛｳ」→「ヤマダタロウ」</p>
                <p>• 全角スペース→半角スペース: 「東京　都」→「東京 都」</p>
                <p>• 数字・英字を統一: 「１２３ＡＢＣ」→「123ABC」</p>
                <p>• カタカナに統一: 「あいう」→「アイウ」</p>
                <p>• 都道府県を漢字に: 「トウキョウト」→「東京都」</p>
                <p>• 市区町村を漢字に: 「シンジュクク」→「新宿区」</p>
                <p>• 電話番号を統一: 「90-1234-5678」→「090-1234-5678」</p>
                <p>• 郵便番号を統一: 「1234567」→「123-4567」</p>
              </div>

              <button
                onClick={handleDataCleaning}
                className="w-full py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold text-lg shadow-lg"
              >
                {isCleaned ? 'もう一度クレンジング実行' : 'クレンジング実行'}
              </button>
            </div>

            {/* ② 列の設定 */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">② 列の設定（並び替え・表示切替）</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {columnSettings.map((col, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-move transition ${
                      col.visible ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                    } ${draggedIndex === index ? 'opacity-50' : ''}`}
                  >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumn(index)}
                      className="w-5 h-5"
                    />
                    <span className={col.visible ? 'font-medium' : 'text-gray-400'}>
                      {col.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ③ データを絞り込む */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                ③ データを絞り込む（オプション）
              </h3>
              <div className="flex gap-3">
                <select
                  value={filterConfig.column}
                  onChange={(e) => setFilterConfig(prev => ({ ...prev, column: e.target.value }))}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg"
                >
                  <option value="">絞り込む列を選択</option>
                  {headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={filterConfig.text}
                  onChange={(e) => setFilterConfig(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="含まれる文字"
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
                {filterConfig.text && (
                  <button
                    onClick={() => setFilterConfig({ column: '', text: '' })}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    クリア
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                例: 備考列から「確認用データ」を含む行のみ表示
                {filterConfig.text && (
                  <span className="ml-2 text-blue-600 font-medium">
                    → {rows.length}行中 {filteredRows.length}行が該当
                  </span>
                )}
              </p>
            </div>

            {/* ④ 列を分割 */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                ④ 列を分割
              </h3>
              <div className="flex gap-3">
                <select
                  value={splitConfig.column}
                  onChange={(e) => setSplitConfig(prev => ({ ...prev, column: e.target.value }))}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg"
                >
                  <option value="">分割する列を選択</option>
                  {headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={splitConfig.delimiter}
                  onChange={(e) => setSplitConfig(prev => ({ ...prev, delimiter: e.target.value }))}
                  placeholder="区切り文字"
                  className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
                <button
                  onClick={handleSplitColumn}
                  disabled={!splitConfig.column}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  分割実行
                </button>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-1">
                <p className="font-medium">📌 分割ルール:</p>
                <p>• すべての行で指定した区切り文字で分割します</p>
                <p>• 例: 空白で分割 →「山田 太郎」→「山田」「太郎」</p>
                <p>• 区切り文字がない行は、2列目が空になります</p>
              </div>
            </div>

            {/* ⑤ 列を統合 */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Merge className="w-5 h-5" />
                ⑤ 列を統合
              </h3>
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {headers.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => toggleMergeColumn(h)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        mergeConfig.columns.includes(h)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={mergeConfig.delimiter}
                  onChange={(e) => setMergeConfig(prev => ({ ...prev, delimiter: e.target.value }))}
                  placeholder="区切り文字"
                  className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
                <button
                  onClick={handleMergeColumns}
                  disabled={mergeConfig.columns.length < 2}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  統合実行 ({mergeConfig.columns.length}列選択中)
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">例: 「姓」と「名」を選択 → 「姓_名_統合」の1列に</p>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-4">
              <button
                onClick={checkErrors}
                className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold"
              >
                エラーチェック
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {downloadStatus || 'ダウンロード'}
              </button>
            </div>

            {/* エラー表示 */}
            {errors.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">エラー検出: {errors.length}件</h3>
                </div>
                <p className="text-sm text-yellow-700">プレビューで赤くハイライトされている箇所を確認してください</p>
              </div>
            )}

            {/* プレビュー */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                プレビュー（最初の50行）
                {filterConfig.text && (
                  <span className="text-blue-600 text-sm ml-2 font-normal">
                    ※ 絞り込み中: {filteredRows.length}行表示
                  </span>
                )}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      {visibleColumns.map((col, i) => (
                        <th key={i} className="p-3 text-left font-semibold border">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {visibleColumns.map((col, colIndex) => {
                          const value = row[col.index];
                          const isError = hasError(rowIndex, col.index);
                          
                          return (
                            <td
                              key={colIndex}
                              className={`p-3 border ${
                                isError ? 'bg-red-100 text-red-800 font-medium' : ''
                              }`}
                            >
                              {value || ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 50 && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  残り{filteredRows.length - 50}行（ダウンロード時に全て含まれます）
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVFormatter;
