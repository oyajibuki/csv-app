// worker.js

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

const COMBINED_MAP = { ...PREFECTURE_MAP, ...CITY_MAP };
const MAP_REGEX = new RegExp(Object.keys(COMBINED_MAP).join('|'), 'g');
const HANKAKU_REGEX = /[ｱ-ﾝﾞﾟｰ･]/;

// 半角カタカナ -> 全角カタカナ
const hankakuToZenkakuKatakana = (str) => {
    if (!str || !HANKAKU_REGEX.test(str)) return str;
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

// カタカナ -> ひらがな
const katakanaToHiragana = (str) => {
    return str.replace(/[\u30a1-\u30f6]/g, (match) => {
        const chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
};

// 全角英数 -> 半角
const zenkakuToHankakuAlphanum = (str) => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
};

// --- 型推定ロジック ---
const detectColumnType = (rows, colIndex, colName = '') => {
    let numericCount = 0;
    let phoneCount = 0;
    let postalCount = 0;
    let kanaCount = 0;
    let nonEmptyCount = 0;

    // ヘッダー名によるヒント (ユーザーの意図を汲む)
    if (colName.includes('電話') || colName.includes('TEL') || colName.includes('携帯')) return 'phone';
    if (colName.includes('郵便') || colName.includes('〒') || colName.includes('ZIP')) return 'postal';
    if (colName.includes('金額') || colName.includes('売上') || colName.includes('価格') || colName.includes('Price') || colName.includes('円')) return 'number';
    if (colName.includes('フリガナ') || colName.includes('ふりがな') || colName.includes('カナ') || colName.includes('よみ')) return 'furigana';
    if (colName.includes('名') || colName.includes('Name')) return 'name';

    const checkLimit = 500;

    for (let i = 0; i < Math.min(rows.length, checkLimit); i++) {
        const val = String(rows[i][colIndex] || '').trim();
        if (!val) continue;
        nonEmptyCount++;

        const cleanVal = zenkakuToHankakuAlphanum(val);
        const digitOnly = cleanVal.replace(/[^\d]/g, '');

        // カタカナ/ひらがな率が高い
        if (/[ァ-ンぁ-ん]/.test(val)) {
            kanaCount++;
        }

        // 電話番号っぽい
        if (digitOnly.length >= 9 && digitOnly.length <= 11) {
            phoneCount++;
        }

        // 郵便番号っぽい
        if (digitOnly.length === 7 || (cleanVal.includes('-') && digitOnly.length === 7)) {
            postalCount++;
        }

        // 金額っぽい (数値のみ、またはカンマ・円マーク含む)
        if (/[\d]/.test(cleanVal) && !cleanVal.includes('-') && !cleanVal.match(/\d{2,4}-\d{2,4}-\d{4}/)) {
            // アルファベットが含まれていない、または通貨記号のみ
            const noCurrency = cleanVal.replace(/[\\¥￥,.\s]/g, '');
            if (/^\d+$/.test(noCurrency)) {
                numericCount++;
            }
        }
    }

    if (nonEmptyCount === 0) return 'text';

    if (kanaCount / nonEmptyCount > 0.5) return 'furigana'; // フリガナ列と推定
    if (phoneCount / nonEmptyCount > 0.3) return 'phone';
    if (postalCount / nonEmptyCount > 0.3) return 'postal';
    if (numericCount / nonEmptyCount > 0.3) return 'number';

    return 'text'; // デフォルト
};


// Workerのメッセージハンドラ
self.onmessage = (e) => {
    const { rows, columnSettings } = e.data;

    try {
        // 1. 各列の型を自動判定
        const detectedTypes = {};
        columnSettings.forEach(col => {
            if (col.visible) {
                detectedTypes[col.index] = detectColumnType(rows, col.index, col.name);
            }
        });

        // 2. クレンジング実行
        const cleanedRows = rows.map(row =>
            row.map((cell, originalColIndex) => {
                const setting = columnSettings.find(c => c.index === originalColIndex);
                if (!setting || !setting.visible) return cell;

                let result = String(cell || '');

                // --- 共通前処理 ---
                // 1. 半角カタカナ -> 全角カタカナ (フリガナ以外でもやっておく)
                result = hankakuToZenkakuKatakana(result);
                // 2. 制御文字除去
                result = result.replace(/[\x00-\x1F\x7F]/g, "");
                // 3. 全角英数 -> 半角英数 (基本方針)
                result = zenkakuToHankakuAlphanum(result);

                const type = detectedTypes[originalColIndex] || 'text';

                // --- タイプ別処理 ---
                if (type === 'number') {
                    // 金額: 不要な文字(アルファベット、#など)を削除
                    // 数字、ドット、マイナスのみ残す
                    const numStr = result.replace(/[^\d.-]/g, '');
                    if (numStr && !isNaN(numStr)) {
                        result = Number(numStr).toLocaleString();
                    } else {
                        result = ''; // 計算不能なゴミは消す
                    }

                } else if (type === 'postal') {
                    // 郵便番号: 数字以外除去
                    let postalNums = result.replace(/[^\d]/g, '');
                    // 7桁なら 3-4 に整形
                    if (postalNums.length === 7) {
                        result = `${postalNums.slice(0, 3)}-${postalNums.slice(3)}`;
                    }
                    // ユーザー指摘: "123456" などの不完全データどうするか？ -> 無理やりハイフンを入れるとすれば
                    else if (postalNums.length >= 6) {
                        // とりあえずハイフンを入れる
                        result = `${postalNums.slice(0, 3)}-${postalNums.slice(3)}`;
                    }
                    else {
                        result = postalNums;
                    }

                } else if (type === 'phone') {
                    // 電話番号
                    let nums = result.replace(/[^\d]/g, '');

                    // 先頭0落ち対応 (9012345678 -> 09012345678)
                    // 10桁で、かつ 90, 80, 70, 50, 20 で始まる場合は携帯・PHSとみなして0を付与
                    // ただし市外局番90-xxxなどの可能性も？ しかしユーザーは0落ちを懸念。
                    if (nums.length === 10 && ['90', '80', '70', '50', '20'].includes(nums.slice(0, 2))) {
                        nums = '0' + nums;
                    }

                    // 9桁の場合 -> 090-123-456 形式かどうかは不明だが、ユーザー例: 901234567 -> 090-1234-567 
                    // 9桁の携帯番号は存在しないが、0落ちで10桁なら上記でキャッチ。
                    // 9桁: 901234567 -> 0390123456? 不明。
                    // ユーザー例: 901234567 -> 0901234567 (10桁)? 
                    // ユーザー例: 901234567 (9桁) -> 090-1234-567 
                    if (nums.length === 9 && ['90', '80', '70'].includes(nums.slice(0, 2))) {
                        nums = '0' + nums; // -> 10桁になる
                    }

                    if (nums.length === 11) {
                        // 携帯: 090-1234-5678
                        result = `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
                    } else if (nums.length === 10) {
                        // 固定: 03-1234-5678 or 06-1234-5678 (簡易)
                        if (nums.startsWith('03') || nums.startsWith('06')) {
                            result = `${nums.slice(0, 2)}-${nums.slice(2, 6)}-${nums.slice(6)}`;
                        } else {
                            // その他: 045-123-4567 等 (3-3-4)
                            result = `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`;
                        }
                    } else {
                        // 9桁以下 -> 可能な限りハイフン
                        result = nums;
                    }

                } else if (type === 'furigana') {
                    // フリガナ: 全てひらがなに統一 + スペース統一
                    result = katakanaToHiragana(result);
                    // スペース正規化 (全角スペース -> 半角スペース)
                    result = result.replace(/　/g, ' ');
                    // 連続スペース除去
                    result = result.replace(/\s+/g, ' ').trim();

                } else {
                    // 通常テキスト (名前、住所など)
                    // 全角スペース -> 半角スペース
                    result = result.replace(/　/g, ' ');
                    // 住所などの番地ハイフン統一 (ー -> -)
                    result = result.replace(/[ー−]/g, '-');
                    // 都道府県ビルトイン変換
                    result = result.replace(MAP_REGEX, matched => COMBINED_MAP[matched]);
                }

                return result;
            })
        );
        self.postMessage({ success: true, cleanedRows });
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};
