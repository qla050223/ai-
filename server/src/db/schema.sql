-- ==================== AI 智能面试平台 数据库表结构 ====================
-- 由后端启动时自动执行（幂等：IF NOT EXISTS）

-- 求职者账号
CREATE TABLE IF NOT EXISTS candidates (
  id            VARCHAR(32)  PRIMARY KEY COMMENT 'ca_xxx',
  name          VARCHAR(64)  NOT NULL,
  email         VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL,
  phone         VARCHAR(32)  DEFAULT NULL,
  avatar        TEXT         DEFAULT NULL,
  registered_at DATE         DEFAULT NULL,
  intention     JSON         DEFAULT NULL COMMENT '求职意向 {position,city,salary,workYears}',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='求职者账号';

-- 简历
CREATE TABLE IF NOT EXISTS resumes (
  id           VARCHAR(32)  PRIMARY KEY COMMENT 'rs_xxx',
  candidate_id VARCHAR(32)  NOT NULL,
  name         VARCHAR(128) NOT NULL,
  uploaded_at  DATE         DEFAULT NULL,
  is_default   TINYINT(1)   DEFAULT 0,
  education    VARCHAR(255) DEFAULT NULL,
  work_years   INT          DEFAULT 0,
  last_company VARCHAR(128) DEFAULT NULL,
  skills       JSON         DEFAULT NULL COMMENT '技能数组',
  projects     JSON         DEFAULT NULL COMMENT '项目数组',
  file_name    VARCHAR(255) DEFAULT NULL COMMENT '上传的源文件名',
  file_path    VARCHAR(255) DEFAULT NULL COMMENT '服务器存储相对路径',
  raw_text     MEDIUMTEXT   DEFAULT NULL COMMENT '解析出的简历原文',
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_resumes_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='求职者简历';

-- 岗位题库（公共）
CREATE TABLE IF NOT EXISTS positions (
  id             VARCHAR(32)  PRIMARY KEY COMMENT 'mp_xxx',
  title          VARCHAR(128) NOT NULL,
  category       VARCHAR(32)  DEFAULT NULL,
  difficulty     VARCHAR(16)  DEFAULT NULL,
  skill_tags     JSON         DEFAULT NULL COMMENT '技能标签数组',
  practice_count INT          DEFAULT 0,
  avg_score      INT          DEFAULT 0,
  description    TEXT         DEFAULT NULL,
  hot            TINYINT(1)   DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位题库';

-- 模拟面试记录
CREATE TABLE IF NOT EXISTS mock_interviews (
  id                 VARCHAR(32) PRIMARY KEY COMMENT 'mi_xxx',
  candidate_id       VARCHAR(32) NOT NULL,
  type               VARCHAR(16) DEFAULT 'mock',
  type_id            VARCHAR(32) DEFAULT NULL COMMENT '岗位 id',
  position_title     VARCHAR(128) DEFAULT NULL,
  date               VARCHAR(32)  DEFAULT NULL,
  duration           INT          DEFAULT 0,
  overall_score      INT          DEFAULT 0,
  recommend_level    VARCHAR(32)  DEFAULT 'pending',
  radar              JSON         DEFAULT NULL COMMENT '能力雷达 {维度:分数}',
  dimensions_covered JSON         DEFAULT NULL COMMENT '覆盖维度数组',
  question_count     INT          DEFAULT 0,
  summary            TEXT         DEFAULT NULL,
  shortboards        JSON         DEFAULT NULL COMMENT '短板数组',
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_interviews_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模拟面试记录';

-- 企业端账号（B 端登录）
CREATE TABLE IF NOT EXISTS org_users (
  id            VARCHAR(32)  PRIMARY KEY,
  name          VARCHAR(64)  NOT NULL,
  email         VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL,
  role          VARCHAR(32)  DEFAULT 'HR',
  role_text     VARCHAR(64)  DEFAULT '招聘 HR',
  org_name      VARCHAR(128) DEFAULT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业端账号';
