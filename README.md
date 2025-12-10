# GAS_Invoice_Automation
GASを用いた請求書作成・PDF化・Slack通知の自動化システム
	
## 概要
毎月手作業で行っていた請求書作成プロセスを完全に自動化。ヒューマンエラーをなくし、発行時間を95%削減しました。

## システムフロー
1. スプレッドシートに請求データを入力
2. GAS実行ボタンを押す
3. Google Docsテンプレートを複製し、データを差し込み
4. ファイルをPDFに変換し、指定のGoogle Driveフォルダに保存
5. 元のDocsファイルを自動削除し、Slackチャンネルへ通知

## 使用技術
Google Apps Script (GAS)
Google Spreadsheet / Google Docs / Google Drive
Slack API (UrlFetchAppを利用したWebhook連携)

## 主な機能
スプレッドシートのデータに基づいた請求書の自動生成とPDF化
金額のカンマ区切り、日付のフォーマット変換などの実務処理
発行済みデータのステータス自動更新
完了通知とPDFダウンロードリンクのSlackへの自動送信

## コードと設定
APIキーやフォルダIDなどの機密情報は公開しておりません。
設定すべき項目: Template ID, Output Folder ID, Slack Webhook URL
