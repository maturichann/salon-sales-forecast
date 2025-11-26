-- 店舗マスタ
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スタッフマスタ
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('eyelist', 'nailist')),
  rank TEXT NOT NULL CHECK (rank IN ('J-1', 'J-2', 'J-3', 'S-1', 'S-2', 'S-3', 'M')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 売上基準マスタ（職種×ランク×季節）
CREATE TABLE sales_standards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL CHECK (job_type IN ('eyelist', 'nailist')),
  rank TEXT NOT NULL CHECK (rank IN ('J-1', 'J-2', 'J-3', 'S-1', 'S-2', 'S-3', 'M')),
  season_type TEXT NOT NULL CHECK (season_type IN ('normal', 'slow', 'busy', 'super_busy')),
  total INTEGER NOT NULL,
  treatment INTEGER NOT NULL,
  retail INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (job_type, rank, season_type)
);

-- 月次出勤データ
CREATE TABLE monthly_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  working_days INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (staff_id, year, month)
);

-- ヘルプ記録
CREATE TABLE help_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  from_store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  to_store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  deduction_percent DECIMAL(5,2) NOT NULL,
  addition_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 予測履歴
CREATE TABLE forecast_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  total_sales INTEGER NOT NULL,
  treatment_sales INTEGER NOT NULL,
  retail_sales INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (year, month, store_id)
);

-- インデックス
CREATE INDEX idx_staff_store ON staff(store_id);
CREATE INDEX idx_attendance_staff ON monthly_attendance(staff_id);
CREATE INDEX idx_attendance_period ON monthly_attendance(year, month);
CREATE INDEX idx_help_staff ON help_records(staff_id);
CREATE INDEX idx_help_period ON help_records(year, month);
CREATE INDEX idx_forecast_period ON forecast_history(year, month);

-- RLS無効（認証なしのため）
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_history ENABLE ROW LEVEL SECURITY;

-- 全員にアクセス許可
CREATE POLICY "Allow all" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales_standards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON monthly_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON help_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON forecast_history FOR ALL USING (true) WITH CHECK (true);

-- 初期データ：売上基準（アイリスト）
INSERT INTO sales_standards (job_type, rank, season_type, total, treatment, retail) VALUES
-- アイリスト - 通常期 (100%)
('eyelist', 'J-1', 'normal', 300000, 250000, 50000),
('eyelist', 'J-2', 'normal', 800000, 700000, 100000),
('eyelist', 'J-3', 'normal', 900000, 800000, 100000),
('eyelist', 'S-1', 'normal', 950000, 850000, 100000),
('eyelist', 'S-2', 'normal', 1000000, 900000, 100000),
('eyelist', 'S-3', 'normal', 1050000, 950000, 100000),
('eyelist', 'M', 'normal', 1100000, 1000000, 100000),
-- アイリスト - 閑散期 (98%)
('eyelist', 'J-1', 'slow', 300000, 250000, 50000),
('eyelist', 'J-2', 'slow', 780000, 680000, 100000),
('eyelist', 'J-3', 'slow', 880000, 780000, 100000),
('eyelist', 'S-1', 'slow', 930000, 830000, 100000),
('eyelist', 'S-2', 'slow', 980000, 880000, 100000),
('eyelist', 'S-3', 'slow', 1000000, 900000, 100000),
('eyelist', 'M', 'slow', 1080000, 980000, 100000),
-- アイリスト - 繁忙期 (106%)
('eyelist', 'J-1', 'busy', 320000, 270000, 50000),
('eyelist', 'J-2', 'busy', 850000, 750000, 100000),
('eyelist', 'J-3', 'busy', 950000, 850000, 100000),
('eyelist', 'S-1', 'busy', 1000000, 900000, 100000),
('eyelist', 'S-2', 'busy', 1060000, 950000, 110000),
('eyelist', 'S-3', 'busy', 1100000, 990000, 110000),
('eyelist', 'M', 'busy', 1170000, 1060000, 110000),
-- アイリスト - 超繁忙期 (110%)
('eyelist', 'J-1', 'super_busy', 330000, 275000, 60000),
('eyelist', 'J-2', 'super_busy', 880000, 770000, 110000),
('eyelist', 'J-3', 'super_busy', 990000, 880000, 110000),
('eyelist', 'S-1', 'super_busy', 1050000, 940000, 110000),
('eyelist', 'S-2', 'super_busy', 1100000, 990000, 110000),
('eyelist', 'S-3', 'super_busy', 1150000, 1040000, 110000),
('eyelist', 'M', 'super_busy', 1210000, 1100000, 110000),

-- ネイリスト - 通常期 (100%)
('nailist', 'J-1', 'normal', 250000, 250000, 0),
('nailist', 'J-2', 'normal', 700000, 660000, 40000),
('nailist', 'J-3', 'normal', 770000, 720000, 50000),
('nailist', 'S-1', 'normal', 820000, 770000, 50000),
('nailist', 'S-2', 'normal', 930000, 880000, 50000),
('nailist', 'S-3', 'normal', 1000000, 950000, 50000),
('nailist', 'M', 'normal', 1040000, 990000, 50000),
-- ネイリスト - 閑散期 (98%)
('nailist', 'J-1', 'slow', 250000, 250000, 0),
('nailist', 'J-2', 'slow', 680000, 640000, 40000),
('nailist', 'J-3', 'slow', 750000, 700000, 50000),
('nailist', 'S-1', 'slow', 800000, 750000, 50000),
('nailist', 'S-2', 'slow', 910000, 860000, 50000),
('nailist', 'S-3', 'slow', 950000, 900000, 50000),
('nailist', 'M', 'slow', 1010000, 970000, 50000),
-- ネイリスト - 繁忙期 (106%)
('nailist', 'J-1', 'busy', 260000, 260000, 0),
('nailist', 'J-2', 'busy', 740000, 700000, 40000),
('nailist', 'J-3', 'busy', 820000, 760000, 60000),
('nailist', 'S-1', 'busy', 870000, 810000, 60000),
('nailist', 'S-2', 'busy', 980000, 930000, 60000),
('nailist', 'S-3', 'busy', 1050000, 990000, 60000),
('nailist', 'M', 'busy', 1100000, 1040000, 60000),
-- ネイリスト - 超繁忙期 (110%)
('nailist', 'J-1', 'super_busy', 280000, 280000, 0),
('nailist', 'J-2', 'super_busy', 770000, 720000, 50000),
('nailist', 'J-3', 'super_busy', 850000, 790000, 60000),
('nailist', 'S-1', 'super_busy', 900000, 840000, 60000),
('nailist', 'S-2', 'super_busy', 1020000, 960000, 60000),
('nailist', 'S-3', 'super_busy', 1100000, 1040000, 60000),
('nailist', 'M', 'super_busy', 1140000, 1080000, 60000);
