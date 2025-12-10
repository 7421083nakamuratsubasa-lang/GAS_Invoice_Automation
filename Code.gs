function createInvoice() {
  // 1. 設定：テンプレートドキュメント・ドライブのID、webhookのURL
  const templateId = 'YOUR_DOCUMENT_TEMPLATE_ID';
  const outputFolderId = 'YOUR_OUTPUT_FOLDER_ID';
  const slackUrl = 'YOUR_SLACK_WEBHOOK_URL';

  // 2. スプレッドシートのデータを取得
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('list');
  // 2行目のデータ（A列〜E列）を取得します
  const data = sheet.getRange(2, 1, 1, 5).getValues()[0]; 

  const id = data[0];       // ID
  const company = data[1];  // 会社名
  const rawDate = data[2];  // 日付
  const item = data[3];     // 品目名
  const price = data[4];    // 金額

  // 日付のフォーマット変換（例：Wed Oct... → 2023/10/20）
  const date = Utilities.formatDate(rawDate, "JST", "yyyy/MM/dd");
  // 金額のカンマ区切り（例：100000 → 100,000）
  const formattedPrice = price.toLocaleString();

  // 3. テンプレートをコピーして新しいドキュメントを作成
  const templateFile = DriveApp.getFileById(templateId);
  // ファイル名を「請求書_会社名」
  const fileName = '請求書_' + company + '_' + date; // ファイル名を日付入りに変更
  const newFile = templateFile.makeCopy(fileName);
  const newDocId = newFile.getId();

  // 4. 新しいドキュメントの中身を置換（書き換え）
  const newDoc = DocumentApp.openById(newDocId);
  const body = newDoc.getBody();

  // { } の部分を実際のデータに置換
  body.replaceText('{ID}', id);
  body.replaceText('{会社名}', company);
  body.replaceText('{日付}', date);
  body.replaceText('{品目名}', item);
  body.replaceText('{金額}', formattedPrice);

  newDoc.saveAndClose(); // 保存して閉じる

  // 5. PDFファイルを作成して指定フォルダに保存
  const pdfBlob = newFile.getAs('application/pdf'); // ドキュメントをPDF形式のデータとして取得
  const outputFolder = DriveApp.getFolderById(outputFolderId);
  
  // PDFファイルを作成し、フォルダに保存
  const pdfFile = outputFolder.createFile(pdfBlob).setName(fileName + '.pdf');
  
  // 6. ドキュメント（元ファイル）を削除
  // 元のドキュメントファイルはPDF化が完了したら不要なので削除します
  DriveApp.getFileById(newDocId).setTrashed(true);
  
  // 7. 完了ログを表示
  console.log('PDF作成成功！作成されたPDFのURL: ' + pdfFile.getUrl());
  
  // ステータスを「発行済」に更新
  sheet.getRange('F2').setValue('発行済');

  // 作成したPDFのURLとファイル名を通知関数に渡す
  sendSlackNotification(slackUrl, fileName, pdfFile.getUrl());
}

/**
 * Slackへメッセージを送信する関数
 * @param {string} url - Slack Webhook URL
 * @param {string} fileName - 作成されたファイル名
 * @param {string} fileUrl - 作成されたPDFのURL
 */
function sendSlackNotification(url, fileName, fileUrl) {
  
  // Slackへ送るメッセージ（JSON形式）を構築
  const payload = {
    // チャンネルに表示されるタイトル
    "text": ":money_with_wings: *【請求書発行完了】* 新しい請求書が作成されました。", 
    "attachments": [
      {
        "color": "#36a64f", // 緑色
        "fields": [
          {
            "title": "ファイル名",
            "value": fileName,
            "short": true
          },
          {
            "title": "発行日時",
            "value": Utilities.formatDate(new Date(), "JST", "MM/dd HH:mm:ss"),
            "short": true
          },
          {
            "title": "PDFダウンロードリンク",
            "value": `<${fileUrl}|ここをクリックしてPDFを確認>`, // ファイルURLをリンクとして表示
            "short": false
          }
        ]
      }
    ]
  };

  // GASのURL Fetch Serviceを使ってSlackにデータを送信
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    Logger.log('Slack通知エラー: ' + e);
  }
}
