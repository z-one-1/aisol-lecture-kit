# EBSi에서 모의고사 자료 받아오기 — 어사이드 에이전트 지시문

클로드 코드가 아래 문장을 채워 `aside exec "…"` 로 실행합니다. (사용자 본인 EBSi 계정으로 본인이 받는 것을 에이전트가 대신 클릭하는 범위. 받은 PDF는 공개·재배포하지 않습니다.)

## 지시문 템플릿
```
EBSi(ebsi.co.kr)에 들어가서 기출문제 → 학력평가 메뉴로 가 줘.
{year}년 {month}월 {grade} 학력평가의 {subject} 과목을 찾아서
문제지 PDF와 정답(해설) PDF를 다운로드해 줘. 로그인이 필요하면 저장된 내 계정으로 로그인해.
다운로드한 파일을 {inbox_dir} 폴더로 옮기고, 파일 이름은 {prefix}-problems.pdf, {prefix}-answers.pdf 로 바꿔 줘.
그다음 같은 회차의 '문항 분석'(오답률) 페이지를 열어 문항 번호와 오답률을 읽어서
{inbox_dir}/{prefix}-wrong-rate.json 에 [{"num": 번호, "wrongRate": 숫자}] 형식으로 저장해 줘.
다 되면 받은 파일 이름 3개만 답해 줘.
```

## 변수
- `{year}` 2026 · `{month}` 9 · `{grade}` 고1 · `{subject}` 영어 · `{prefix}` 2609-h1-eng · `{inbox_dir}` 이 키트의 inbox 절대 경로

## 끝난 뒤 클로드 코드가 할 일
1. `inbox/{prefix}-problems.pdf` 를 `pdftoppm -r 110 -png` 로 쪽 이미지로 만들고, 문항별로 전사 → `problems/{prefix}-{번호}.json` (CLAUDE.md 대본 규칙)
2. 정답 PDF로 answer 대조. 틀리면 만들지 않는다.
3. `wrong-rate.json` 이 있으면 오답률 높은 순으로 제작 순서 정렬(`npm run batch -- --limit N`)
4. 수학은 수식을 `$...$` LaTeX 로. 도표·그림 문항은 건너뛰고 사용자에게 알린다.

## 주의
- EBSi 자료는 "EBSi에서만 제공, 무단 전재·재배포 금지". 키트·영상·전자책에 PDF를 동봉하지 않는다.
- 출판사 교재 문항은 사진으로 inbox에 넣고, 영상은 학원 내부용으로만.
