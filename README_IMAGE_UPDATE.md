# Product Image Update Guide

## 개요
제품 이미지를 Unsplash 외부 링크에서 로컬 이미지로 교체하는 가이드입니다.

## 필요한 파일

### 1. 이미지 파일들
다음 이미지 파일들을 `backend/uploads/products/` 폴더에 복사해야 합니다:

- `french_fries.png` (프렌치 프라이)
- `spicy_chicken_burger.png` (스파이시 치킨 버거)
- `mushroom_swiss_burger.png` (머쉬룸 스위스 버거)
- `cheese_sticks.png` (치즈스틱)
- `sprite.png` (스프라이트)

### 2. SQL 스크립트
`update_product_images.sql` 파일을 사용합니다.

## 설치 방법

### Step 1: 이미지 파일 복사
```bash
# backend 디렉토리로 이동
cd backend

# uploads/products 폴더 생성 (없는 경우)
mkdir -p uploads/products

# 이미지 파일들을 uploads/products/ 폴더에 복사
# (이미지 파일들은 팀원에게서 받거나 공유 드라이브에서 다운로드)
```

### Step 2: SQL 스크립트 실행

#### 방법 1: MySQL CLI 사용
```bash
mysql -u root -p nadea_burger_db < update_product_images.sql
```

#### 방법 2: MySQL Workbench 사용
1. MySQL Workbench 열기
2. `nadea_burger_db` 데이터베이스 연결
3. `update_product_images.sql` 파일 열기
4. 실행 (⚡ 아이콘 클릭 또는 Ctrl+Shift+Enter)

#### 방법 3: Node.js 스크립트 사용
```bash
node -e "
const pool = require('./db');
const fs = require('fs');

(async () => {
  try {
    const sql = fs.readFileSync('update_product_images.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      await pool.execute(statement);
    }
    
    console.log('✅ Image URLs updated successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
"
```

### Step 3: 확인
```bash
# 이미지 파일 확인
ls -lh uploads/products/

# 데이터베이스 확인
mysql -u root -p nadea_burger_db -e "SELECT id, name, image_url FROM products WHERE id IN (3, 6, 7, 9, 10);"
```

## 업데이트되는 제품 목록

| ID | 제품명 | 새 이미지 경로 |
|----|--------|----------------|
| 3  | French Fries | `/uploads/products/french_fries.png` |
| 6  | Spicy Chicken Burger | `/uploads/products/spicy_chicken_burger.png` |
| 7  | Mushroom Swiss Burger | `/uploads/products/mushroom_swiss_burger.png` |
| 9  | Cheese Sticks | `/uploads/products/cheese_sticks.png` |
| 10 | Sprite | `/uploads/products/sprite.png` |

## 주의사항

1. **이미지 파일을 먼저 복사**한 후 SQL을 실행하세요.
2. 서버가 실행 중이면 자동으로 새 이미지를 제공합니다.
3. 이미지 파일명과 SQL의 경로가 정확히 일치하는지 확인하세요.

## 문제 해결

### 이미지가 표시되지 않는 경우
1. 이미지 파일이 올바른 위치에 있는지 확인
   ```bash
   ls -la backend/uploads/products/
   ```

2. 파일 권한 확인
   ```bash
   chmod 644 backend/uploads/products/*.png
   ```

3. 서버 재시작
   ```bash
   npm run dev
   ```

4. 브라우저에서 직접 접근 테스트
   ```
   http://localhost:3000/uploads/products/french_fries.png
   ```
