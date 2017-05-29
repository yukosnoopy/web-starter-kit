# web-starter-kit


## 使用方法
1. ファイルを作業フォルダに落とす  
`$ git clone https://github.com/yukosnoopy/web-starter-kit.git`

2. パッケージをインストール  
`$ npm i`

3. Debug build  
`$ gulp` or `$ npm run dev`
  - CSSをminifyしない
  - CSSソースマップを出力する

4. Release build  
`$ npm run prod`
  - CSSをminifyする
  - CSSソースマップを出力しない


## CSS設計手法
FLOCSS( https://github.com/hiloki/flocss )を採用
