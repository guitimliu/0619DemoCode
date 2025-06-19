# 第六章：寫完測試，然後呢？執行測試的時機和方法

## 6-1 前置指令與手動觸發測試

### 前置指令

專案中的設定檔 package.json，裡面包含專案中的所需相關依賴、資訊輔助指令。這些指令包含建置、執行和測試專案的方式。

以 Jest 為例：

```javascript
"scripts": {
    "test": "jest --config jest.config.js"
  },
```

#### 這個 jest.config.ts 是做什麼用的？

```
npx jest --init
```

小精靈會問你 5 個問題

```
✔ Would you like to use Typescript for the configuration file?

1. 你想要使用 TypeScript 來撰寫 Jest 的設定檔嗎？
yes：建立 jest.config.ts（適合使用 TypeScript 開發者）
no：建立 jest.config.js

👉說明： 選擇 yes 可以讓你的設定檔支援型別提示與 IDE 補全，特別適合 TypeScript 專案。
```

```
✔ Choose the test environment that will be used for testing ?

2. 請選擇測試將使用的執行環境：
node：用於 Node.js 環境（適合測試後端邏輯、純函式）
jsdom：模擬瀏覽器的 DOM 環境（適合前端元件、DOM 操作測試）

👉 說明： 如果你的程式會操作 DOM（例如 document.querySelector()），就必須選擇 jsdom。
```

```
✔ Do you want Jest to add coverage reports? …

3. 你希望 Jest 在測試時自動產生覆蓋率報告嗎？
yes：啟用程式碼涵蓋率報告（coverage）
no：不產生報告

👉 說明： 覆蓋率能幫助你知道哪些程式碼有被測試到。
選擇 yes 會讓 jest.config.ts 裡加上 collectCoverage: true。
```

```
✔ Which provider should be used to instrument code for coverage?

4. 你想使用哪一個覆蓋率偵測引擎（Coverage Provider）來收集程式碼覆蓋率？
babel：使用 Babel 來插入追蹤點（適合有用 Babel 的專案）
v8：使用 V8 原生的方式來插入追蹤點（較新，執行效能更好）

👉 說明： 只要你沒用 Babel 建構流程，建議選 v8。速度快，也是 Jest 的預設推薦選項。
```

```
✔ Automatically clear mock calls, instances, contexts and results before every test?

5. 是否要在每次測試前，自動清除 mock 的呼叫紀錄、實例、上下文與結果？
yes：每次測試前自動清除 mock 狀態（推薦）
no：mock 狀態可能會殘留到下一個測試

👉 說明： 為了避免測試之間互相干擾，建議開啟這個選項，這樣每個測試都是乾淨的。
```

<!--
TypeScript (.ts) 轉成 JavaScript 時，如果你用 ES Module (export/import) 語法，Jest 會需要支援 ESM。

JavaScript (.js) 檔案如果是用 ES Module 語法（export、import），但 Jest 預設是用 CommonJS，會出錯。


```
npm install --save-dev jest-environment-jsdom
```
補充說明
Jest 之前是內建 jsdom 環境

從 Jest 28 以後，改成獨立套件

你必須自行安裝並配置 -->

完成之後就會自動出現一份 jest 的設定檔

```
my-project/
├── node_modules/
├── src/
│   └── your-code.ts
├── tests/
│   └── your-code.test.ts
├── jest.config.js        👈 就是放這裡
├── package.json
└── tsconfig.json
```

所以剛剛的問題

#### jest.config.js 是在做什麼的？

👉 用來定義測試的行為，例如：要測試哪些檔案？測試環境是瀏覽器還是 Node？是否要收集 coverage？

## Jest 常用設定與適用情境

| 設定名稱                            | 說明                                                         | 常見情境 / 為什麼設定它                                        |
| ----------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| `testEnvironment`                   | 測試執行環境（預設是 `node`，也可用 `jsdom`）                | 網頁專案通常選 `jsdom` 模擬瀏覽器環境；純後端選 `node`         |
| `transform`                         | 指定用什麼工具轉譯測試程式碼（例如 ts-jest、babel-jest）     | 專案用 TypeScript 或現代 JS 語法時，需要轉譯才能跑測試         |
| `testMatch` / `testRegex`           | 指定哪些檔案是測試檔案                                       | 依專案結構調整，排除不必要的檔案，或指定特殊命名規則           |
| `moduleFileExtensions`              | 指定測試時可辨識的檔案副檔名                                 | 有多種語言或副檔名時，確保能抓到正確檔案                       |
| `setupFiles` / `setupFilesAfterEnv` | 在測試環境初始化時要先執行的程式碼                           | 需要全局設定、mock、或第三方測試工具初始化（如 jest-extended） |
| `moduleNameMapper`                  | 模組別名映射，解決相對路徑或資源檔案（如 CSS、圖片）導入問題 | 專案中常用絕對路徑或有樣式/圖片導入時，避免測試出錯            |
| `collectCoverage`                   | 是否啟用測試覆蓋率收集                                       | 想了解測試覆蓋率，追蹤未測試到的程式碼                         |
| `coverageDirectory`                 | 指定覆蓋率報告輸出目錄                                       | 改變輸出位置方便 CI、報告管理                                  |
| `coveragePathIgnorePatterns`        | 覆蓋率忽略的路徑或檔案                                       | 不想統計第三方庫、測試工具或某些檔案的覆蓋率                   |
| `verbose`                           | 測試結果輸出更詳細                                           | 調試時想知道每個測試檔案執行結果                               |
| `testTimeout`                       | 測試超時時間設定（毫秒）                                     | 測試比較複雜、慢時調整，避免誤判測試失敗                       |
| `globals`                           | 設定全域變數或配置（通常給 ts-jest 用）                      | 使用 ts-jest 或其他工具時，需要額外參數配置                    |

### 如果沒有 config 檔 預設內容為何？

| 項目名稱               | 預設值                                            | 說明                                                                                   |
| ---------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- | --- |
| `testMatch`            | \`\["**/tests/**/_.\[jt]s?(x)", "\*\*/?(_.)+(spec | test).\[jt]s?(x)"]\` 自動匹配 `tests` 資料夾內或檔名包含 `spec` / `test` 的 JS/TS 檔案 |     |
| `testEnvironment`      | `node`                                            | 使用 Node.js 為測試環境（不模擬瀏覽器）                                                |     |
| `transform`            | 無                                                | 若使用 TypeScript 或 ES Module 會因無法轉譯而報錯                                      |     |
| `moduleFileExtensions` | `["js", "json", "jsx", "ts", "tsx", "node"]`      | 支援這些副檔名作為模組載入                                                             |     |
| `coverage`             | 不開啟                                            | 需手動加入 `--coverage` 才會產出覆蓋率報告                                             |     |

### 手動觸發測試 vs 自動觸發測試

手動觸發測試就是在自己的本機開發環境中，手動執行測試命令（例：npm run test)

如果希望只要**更新檔案**就重新測試，可以適用 watch mode 來監測檔案。

```
jest --watch	          #只重跑有更動的檔案（非 Git 環境不會啟用）
jest --watchAll	  #全部監聽與重新測試
jest --watch --coverage  #同時監聽並產出覆蓋率報告
```

### 想想 ❓ 為什麼 --watch 一定要有 git 呢？

因為它會利用 Git 的資訊（例如：哪些檔案被修改、哪些檔案與測試相關）來智慧地只執行必要的測試。
若不是 Git 專案，這些資訊無法取得，Jest 就不啟用 watch。

## 6-2 在合併程式碼之前執行測試

在合併程式碼之前都盡量要多執行測試，適合的時機點有下列幾種方式：

### 1. pre-commit

顧名思義就是在 commit 之前進行測試，若測試未通過，則不會 commit 程式碼，程式碼會繼續放在 staged 階段。

##### 常見 pre-commit 工具與套件

[husky](https://typicode.github.io/husky/get-started.html) 是能在 git 指令執行前，做些事情的鉤子 (git hooks)，像是整理程式碼、跑測試等，目的是當檢查項目不通過時，就不要 commit 程式碼、搞壞 code base。

[lint-staged](https://www.npmjs.com/package/lint-staged) 用於指定檢查範圍，只針對放入 staged 檔案而非整個專案做修改，或是根據檔案類型分別設定指令。

##### 安裝流程

```sell
npm install --save-dev husky lint-staged *安裝
npx husky init  *初始化
```

![截圖 2025-06-14 晚上7.16.46](https://hackmd.io/_uploads/r1O8Kko7xl.png)
初始化後 husky 會自動在 script 裡加入` "prepare": "husky"` 。
這個 script 會在 npm install 的時候執行，用意是當其他人下載專案包時可以自動執行 husky install，載入 .husky.sh 的執行檔。

> 如果專案資料夾跟 .git 資料夾不在同一層（像是 monorepo），可以參考[ Project Not in Git Root Directory](https://typicode.github.io/husky/how-to.html#project-not-in-git-root-directory)。
> 主要是直接改 package.json 裡 script 的 prepare 指令
> `"prepare": "cd ../ && husky install <ProjectFolderName>/.husky"`
> 這樣的用意是先 cd 到有 .git 資料夾的地方，再執行 husky install，並且指定 husky 的路徑。

package.json 手動加入 lint-staged 要執行的格式化命令。可依照自己的需求來修改，以下提供參考：

```javascript
"lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
```

```javascript
{
  "lint-staged": {
    "**/*.{ts,tsx,js,jsx,css,scss,json,md}": ["prettier --write"],
    "**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
    "**/*.{css,scss}": ["stylelint --fix"]
  }
}
```

如果格式化指令有用到 ESLint ，記得也要安裝[Eslint](https://eslint.org/docs/latest/use/getting-started)相關套件

```
npm init @eslint/config@latest
```

通過問答後系統會自動幫你安裝相關的依賴，並產生一份設定檔`eslint.config.mjs`

這時候你可以故意用錯誤格式試試看， ESLint 有沒有正確格式化
你肯定會看到一推問題的，別擔心～ 因為 ESLint 預設並不知道你在寫的是 Jest 測試檔案，所以它會把 describe、it、expect 判定成「未定義的變數」報錯
![截圖 2025-06-14 晚上10.39.20](https://hackmd.io/_uploads/HJk3YbiQle.png)
寫法請參考 [說明](https://www.npmjs.com/package/eslint-plugin-jest)

```javascript
  import pluginJest from "eslint-plugin-jest";
{
    // update this to match your test files
    files: ['**/*.spec.js', '**/*.test.js'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
```

繼續執行後，大家可能又會發現第 2 個錯誤
![截圖 2025-06-14 晚上11.08.32](https://hackmd.io/_uploads/HJmtgGoQge.png)

看到 require 應該就可以想到一定是 CommonJS 和 ESModule 的差異原因了，因為 Jest 是預設使用 CJS ，所以要在設定檔特別註明是 node 環境

```javascript
  //jest:
    {
    languageOptions: {
       globals: {
      ...globals.node,👈 這行
      ...pluginJest.environments.globals.globals,👈 這裡也要改
    },
  },


```

> 補充：
> `git commit -m "test" --no-verify`則會讓 git commit 繞過 pre-commit 機制，或是在個別檔案的開頭對 eslint 用註解設定 /_ eslint-disable _/，企圖跳過某個檔案，不做檢查。
> 這都是非常不好的作法，千萬不要用！

![image](https://hackmd.io/_uploads/rJ671i57eg.png)

#### 說明流程：

Step 1：commit code 時 (注意不是 push code)，會觸發 husky 幫忙執行預定要做的檢查項目，像是 linter 和跑測試。想知道自己專案要做什麼可檢查設定檔 .husky/pre-commit 或 package.json 中的 husky 設定。
Step 2：如果檢查項目都通過，就會做 commit，反之沒過就會讓程式碼留在 **staged** 階段。

### 2. pre-push

![image](https://hackmd.io/_uploads/r1EAks9Xeg.png)
Step 1：更新程式碼並做 commit。
Step 2：執行 git push 推 code 到 remote，這時觸發 git pre-push hook 來跑 lint 和 unit test。在這個階段可提早找出錯誤，防止浪費 CI/CD 的資源來做這些無謂的確認。
Step 3：若有錯誤則修正錯誤，並重新推 code 到 remote。若全部檢查都通過，就推 code 到 remote，若沒有通過，所有變更都留在 local。

### 3.在提交 PR 時執行測試

許多專案會選擇在程式碼合併回主分支時確認 codebase 是否正常運作，所以可以在提交 PR 時執行測試。
如果是用 GitHub，就可以使用**GitHub Actions**來執行。[關於 GitGub Action](https://ithelp.ithome.com.tw/articles/10262377)

先請 GPT 產出一個很基本的 ESlint 和測試 yaml 檔

```yaml
name: PR Test + Lint

on:
  pull_request:
    branches:
      - main # PR 對 main 分支時觸發

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout PR code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18 # 如果你的 Node 是 18 或其他版本，請改掉

      - name: Install dependencies
        run: npm install

      - name: Run ESLint
        run: npx eslint . --ext .js,.ts,.vue

      - name: Run Prettier check
        run: npx prettier --check .

      - name: Run Unit Tests (Jest)
        run: npm test
```

#### 操作流程：

GitGub > Actions > New workflow > 1. 可以搜尋已經有人提供的 workflow 或是 2.自己新建一個 > 點 “set up a workflow yourself” > 把 yaml 檔寫好後 > commit changes

#### 測試看看：

新建一個分支 `git checkout -B F/newPR`
commit 完之後，回 GitHub 上發 PR

#### 結果:

不成功長這樣
![截圖 2025-06-17 凌晨12.30.41](https://hackmd.io/_uploads/Bk1X6aaXgx.png)
成功長這樣
![截圖 2025-06-17 凌晨12.57.24](https://hackmd.io/_uploads/HyMZT6p7xe.png)

以上就是在合併程式碼之前進行測試的時機
