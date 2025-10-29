# Discord.js 종합 미니게임 봇 템플릿

이 리포지토리는 Discord.js(v14)와 TypeScript로 만든 종합 미니게임 봇 템플릿입니다. 다양한 미니게임(1:1, 채널 전체, 수집형)이 번들로 제공되며, 실시간 게임 상태와 영구 통계를 효율적으로 관리합니다.

## 주요 기능

### 기술 스택
- **언어**: Node.js + TypeScript
- **라이브러리**: Discord.js v14
- **로컬라이제이션**: Discord.js 내장 함수 (setNameLocalization) 사용
- **상태 관리**:
  - 메모리 (RAM): `Map` 객체로 현재 진행 중인 게임 상태 관리
  - 영구 저장소: `game_stats.json` 파일로 통계 및 수집품 저장

### 게임 목록

#### 1:1 빠른 게임 (vs. 봇/유저)
- **가위바위보** (`/rps`): 버튼으로 봇과 대결
- **틱택토** (`/tic-tac-toe`): 3x3 버튼으로 봇 또는 유저와 대결
- **블랙잭** (`/blackjack`): 히트/스탠드 버튼으로 봇과 카드 게임
- **숫자야구** (`/number-baseball`, `/guess`): 3자리 숫자 맞추기

#### 채널 전체 참여 게임
- **끝말잇기** (`/word-relay`): 채널에서 끝말잇기 게임
- **초성퀴즈** (`/quiz`): 채팅으로 초성 힌트를 보고 정답 맞추기
- **타자배틀** (`/typing`): 주어진 문장을 가장 빨리 입력하기

#### 포인트/도박 게임
- **슬롯머신** (`/slots`): 3개의 랜덤 이모지로 포인트 획득
- **동전던지기** (`/coinflip`): 앞면/뒷면을 선택하여 포인트 베팅

#### 수집/성장형 게임
- **낚시** (`/fishing`): 쿨타임 30분, 랜덤 물고기 수집
- **도감** (`/collection`): 수집한 물고기 목록 확인

#### 기타
- **순위표** (`/leaderboard`): 게임별 Top 10 순위 확인

## 요구사항
- Node.js 18 이상 권장
- npm

## 빠른 시작

1. 리포지토리 복제

```bash
git clone <your-repo-url>
cd template-djs-boilerplate
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 다음 값을 채우세요:

```
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
```

4. 개발 모드로 실행

```bash
npm run dev
```

5. 빌드 및 시작 (프로덕션)

```bash
npm run build
npm start
```

> package.json에 정의된 스크립트:

- `dev` : `tsx watch src/index.ts` (개발 중 빠른 재시작)
- `build`: `tsc -p tsconfig.json` (TypeScript 컴파일)
- `start`: `npm run build && node dist/index.js` (빌드 후 실행)

## 환경 변수
`src/config.ts`에서 사용되는 환경 변수는 다음과 같습니다:

- `DISCORD_TOKEN` - 봇 토큰
- `DISCORD_CLIENT_ID` - 애플리케이션(클라이언트) ID

필수 변수들이 설정되어 있지 않으면 실행 시 에러가 발생합니다.

## 프로젝트 구조

```
src/
  config.ts              # 환경변수 로드 및 검증
  deploy-commands.ts     # 슬래시 커맨드 등록 스크립트
  index.ts               # 엔트리 포인트
  scheduler.ts           # 스케줄러 예시
  gameState.ts           # 게임 상태 관리 (메모리)
  commands/              # 커맨드 정의 폴더
    leaderboard.ts       # 순위표
    rps.ts               # 가위바위보
    tic-tac-toe.ts       # 틱택토
    blackjack.ts         # 블랙잭
    number-baseball.ts   # 숫자야구
    guess.ts             # 숫자 추측
    word-relay.ts        # 끝말잇기
    quiz.ts              # 초성퀴즈
    typing.ts            # 타자배틀
    slots.ts             # 슬롯머신
    coinflip.ts          # 동전던지기
    fishing.ts           # 낚시
    collection.ts        # 도감
    index.ts             # 커맨드 로더
  events/                # 이벤트 핸들러
    messageCreate.ts     # 채팅 기반 게임 처리
  utils/                 # 유틸리티
    stats.ts             # 통계 관리 (JSON)
game_stats.json          # 영구 통계 저장소 (자동 생성)
```

## 슬래시 커맨드 배포

개발 시 TypeScript 파일을 직접 실행하려면 `tsx`를 사용합니다:

```bash
npx tsx src/deploy-commands.ts
```

프로덕션 환경에서는 먼저 빌드한 뒤 dist 파일을 실행하세요:

```bash
npm run build
node dist/deploy-commands.js
```

> 배포 스크립트는 Discord 애플리케이션에 커맨드를 등록합니다. GUILD 단위 배포/전역 배포 등 스크립트 내용을 확인해 필요에 맞게 조정하세요.

## 명령어·이벤트 추가 가이드

1. `src/commands` 폴더에 새 커맨드 파일을 추가합니다.
2. `src/commands/index.ts`에서 새 커맨드를 import하고 export합니다.
3. 모든 명령어는 `setNameLocalizations({ ko: '한국어이름' })`을 사용해야 합니다.
4. 게임 상태는 `src/gameState.ts`의 Map 객체를 사용합니다.
5. 영구 통계는 `src/utils/stats.ts`의 함수를 사용합니다.

### 상태 관리 가이드

**메모리 (휘발성 - 봇 재시작 시 사라짐)**
- `src/gameState.ts`의 Map 객체 사용
- 현재 진행 중인 게임 상태 저장
- 예: 틱택토 보드 상태, 블랙잭 카드 패

**영구 저장소 (game_stats.json)**
- `src/utils/stats.ts`의 함수 사용
- 유저 승수, 포인트, 수집품 저장
- 리더보드 데이터 조회

## 출처(Attribution)

이 템플릿을 기반으로 한 프로젝트는 원저작자 표기(출처)를 남기면 됩니다. 예시 문구:

```
This project is based on dishostkr/template-djs-boilerplate (https://github.com/dishostkr/template-djs-boilerplate)
```

또는 한글 문구로:

```
이 프로젝트는 dishostkr/template-djs-boilerplate를 기반으로 합니다 (https://github.com/dishostkr/template-djs-boilerplate)
```

출처 표기를 하려면 README, 프로젝트 홈페이지, 혹은 배포 패키지의 적절한 위치에 위 문구를 포함시키면 됩니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 리포지토리 루트의 `LICENSE` 파일을 확인하세요.

요약: 이 템플릿을 사용한 프로젝트는 원저작자 표기(출처)를 남기면 됩니다(MIT의 저작권 고지 유지).
