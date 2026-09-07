-- =====================================================================
-- AI 智能面试平台 数据库设计脚本
-- 适用数据库：MySQL 8.0+
-- 字符集：utf8mb4 / 排序规则：utf8mb4_unicode_ci
-- 引擎：InnoDB
-- 说明：涵盖 B 端（企业）+ C 端（求职者）双端实体，含外键与索引
-- =====================================================================

-- ---------- 1. 建库 ----------
DROP DATABASE IF EXISTS `ai_interview`;
CREATE DATABASE `ai_interview`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `ai_interview`;

-- =====================================================================
-- 一、账号与组织管理
-- =====================================================================

-- 企业组织表
CREATE TABLE `organizations` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '组织ID',
  `name`            VARCHAR(128)    NOT NULL                COMMENT '企业名称',
  `industry`        VARCHAR(64)     DEFAULT NULL            COMMENT '行业',
  `size`            VARCHAR(32)     DEFAULT NULL            COMMENT '规模（如 100-500人）',
  `package_plan`    VARCHAR(32)     DEFAULT 'free'          COMMENT '套餐：free/basic/pro/enterprise',
  `contact_name`    VARCHAR(64)     DEFAULT NULL            COMMENT '联系人',
  `contact_phone`   VARCHAR(32)     DEFAULT NULL            COMMENT '联系电话',
  `status`          TINYINT         NOT NULL DEFAULT 1      COMMENT '状态：1正常 0禁用',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL            COMMENT '软删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业组织';

-- 企业用户表（HR / 面试官 / 管理员）
CREATE TABLE `org_users` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `org_id`          BIGINT UNSIGNED NOT NULL                COMMENT '所属组织',
  `name`            VARCHAR(64)     NOT NULL                COMMENT '姓名',
  `email`           VARCHAR(128)    NOT NULL                COMMENT '企业邮箱',
  `phone`           VARCHAR(32)     DEFAULT NULL            COMMENT '手机号',
  `password_hash`   VARCHAR(255)    NOT NULL                COMMENT '密码哈希（bcrypt）',
  `role`            VARCHAR(32)     NOT NULL DEFAULT 'member' COMMENT '角色：super_admin/hr_admin/interviewer/member',
  `avatar_url`      VARCHAR(512)    DEFAULT NULL,
  `status`          TINYINT         NOT NULL DEFAULT 1      COMMENT '1正常 0禁用',
  `last_login_at`   DATETIME        DEFAULT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_org_email` (`org_id`, `email`),
  KEY `idx_org_role` (`org_id`, `role`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_org_users_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业用户';

-- =====================================================================
-- 二、岗位与候选人管理
-- =====================================================================

-- 岗位表（JD）
CREATE TABLE `positions` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `org_id`          BIGINT UNSIGNED NOT NULL                COMMENT '所属组织',
  `title`           VARCHAR(128)    NOT NULL                COMMENT '岗位名称',
  `department`      VARCHAR(64)     DEFAULT NULL            COMMENT '部门',
  `jd_text`         TEXT            DEFAULT NULL            COMMENT 'JD 原文',
  `skill_points`    JSON            DEFAULT NULL            COMMENT 'AI 抽取的技能点数组',
  `difficulty`      TINYINT         DEFAULT 2               COMMENT '难度等级 1-5',
  `headcount`       INT             DEFAULT 1               COMMENT '招聘人数',
  `is_template`     TINYINT         NOT NULL DEFAULT 0      COMMENT '是否为岗位模板 1是 0否',
  `status`          VARCHAR(16)     NOT NULL DEFAULT 'open' COMMENT 'open/closed/on_hold',
  `created_by`      BIGINT UNSIGNED DEFAULT NULL            COMMENT '创建人',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_org_status` (`org_id`, `status`),
  KEY `idx_org_template` (`org_id`, `is_template`),
  CONSTRAINT `fk_positions_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位JD';

-- 候选人表（企业侧候选人档案）
CREATE TABLE `candidates` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `org_id`          BIGINT UNSIGNED NOT NULL                COMMENT '所属组织',
  `name`            VARCHAR(64)     NOT NULL                COMMENT '姓名',
  `phone`           VARCHAR(32)     DEFAULT NULL            COMMENT '手机号',
  `email`           VARCHAR(128)    DEFAULT NULL            COMMENT '邮箱',
  `applied_position_id` BIGINT UNSIGNED DEFAULT NULL        COMMENT '应聘岗位',
  `source`          VARCHAR(64)     DEFAULT NULL            COMMENT '来源渠道',
  `status`          VARCHAR(20)     NOT NULL DEFAULT 'pending' COMMENT 'pending/interviewing/evaluating/passed/rejected/hold',
  `intention`       JSON            DEFAULT NULL            COMMENT '求职意向 {position,city,salary,workYears}',
  `ats_source`      VARCHAR(32)     DEFAULT NULL            COMMENT 'ATS来源厂商（V2）',
  `ats_entity_id`   VARCHAR(128)    DEFAULT NULL            COMMENT 'ATS侧实体ID（V2）',
  `ats_raw_payload` JSON            DEFAULT NULL            COMMENT 'ATS原始数据（V2）',
  `created_by`      BIGINT UNSIGNED DEFAULT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_org_status` (`org_id`, `status`),
  KEY `idx_applied_position` (`applied_position_id`),
  KEY `idx_ats` (`ats_source`, `ats_entity_id`),
  CONSTRAINT `fk_candidates_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_candidates_position` FOREIGN KEY (`applied_position_id`) REFERENCES `positions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业候选人';

-- 简历表
CREATE TABLE `resumes` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `candidate_id`    BIGINT UNSIGNED NOT NULL                COMMENT '候选人ID（企业侧）',
  `candidate_account_id` BIGINT UNSIGNED DEFAULT NULL       COMMENT '求职者账号ID（C端上传时）',
  `file_name`       VARCHAR(255)    DEFAULT NULL            COMMENT '原始文件名',
  `file_path`       VARCHAR(512)    DEFAULT NULL            COMMENT '文件存储路径',
  `file_url`        VARCHAR(512)    DEFAULT NULL            COMMENT '文件访问URL',
  `file_size`       BIGINT          DEFAULT NULL            COMMENT '文件大小（字节）',
  `mime_type`       VARCHAR(64)     DEFAULT NULL            COMMENT '文件类型',
  `raw_text`        MEDIUMTEXT      DEFAULT NULL            COMMENT '解析出的纯文本',
  `parsed`          JSON            DEFAULT NULL            COMMENT '结构化解析结果 {skills,projects,education,workYears,lastCompany,...}',
  `vector_id`       VARCHAR(128)    DEFAULT NULL            COMMENT '向量库ID',
  `is_default`      TINYINT         NOT NULL DEFAULT 0      COMMENT '是否默认简历',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_candidate_account` (`candidate_account_id`),
  KEY `idx_default` (`candidate_id`, `is_default`),
  CONSTRAINT `fk_resumes_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历';

-- =====================================================================
-- 三、题库中心
-- =====================================================================

-- 题库表
CREATE TABLE `question_banks` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `org_id`          BIGINT UNSIGNED NOT NULL                COMMENT '所属组织（公共题库 org_id=0）',
  `position_id`     BIGINT UNSIGNED DEFAULT NULL            COMMENT '关联岗位',
  `title`           VARCHAR(128)    NOT NULL                COMMENT '题库名称',
  `source`          VARCHAR(16)     NOT NULL DEFAULT 'auto' COMMENT '来源：auto(AI生成)/manual(手动)/mixed',
  `is_public`       TINYINT         NOT NULL DEFAULT 0      COMMENT '是否企业公共题库',
  `is_template`     TINYINT         NOT NULL DEFAULT 0      COMMENT '是否岗位模板题库',
  `dimensions`      JSON            DEFAULT NULL            COMMENT '考察维度数组',
  `created_by`      BIGINT UNSIGNED DEFAULT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_org` (`org_id`),
  KEY `idx_position` (`position_id`),
  CONSTRAINT `fk_banks_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_banks_position` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题库';

-- 题目表
CREATE TABLE `questions` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bank_id`         BIGINT UNSIGNED NOT NULL                COMMENT '所属题库',
  `dimension`       VARCHAR(32)     DEFAULT NULL            COMMENT '考察维度：专业技能/项目经验/逻辑思维/沟通表达/学习能力/文化匹配',
  `skill_point`     VARCHAR(128)    DEFAULT NULL            COMMENT '技能点',
  `question_type`   VARCHAR(16)     NOT NULL DEFAULT 'open' COMMENT '题型：open/scenario/project/behavior',
  `difficulty`      TINYINT         DEFAULT 2               COMMENT '难度 1-5',
  `content`         TEXT            NOT NULL                COMMENT '题目内容',
  `reference_points` JSON           DEFAULT NULL            COMMENT '参考答案要点数组',
  `scoring_rubric`  JSON            DEFAULT NULL            COMMENT '评分标准 {excellent,qualified,unqualified}',
  `follow_up_suggestions` JSON      DEFAULT NULL            COMMENT '追问建议数组',
  `tags`            JSON            DEFAULT NULL            COMMENT '自定义标签数组',
  `use_count`       INT             NOT NULL DEFAULT 0      COMMENT '使用次数',
  `avg_score`       DECIMAL(5,2)    DEFAULT NULL            COMMENT '平均得分',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bank` (`bank_id`),
  KEY `idx_dimension` (`dimension`),
  KEY `idx_type_difficulty` (`question_type`, `difficulty`),
  CONSTRAINT `fk_questions_bank` FOREIGN KEY (`bank_id`) REFERENCES `question_banks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目';

-- =====================================================================
-- 四、面试管理（核心）
-- =====================================================================

-- 面试表（正式面试 + 模拟面试统一表，通过 type 区分）
CREATE TABLE `interviews` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `org_id`          BIGINT UNSIGNED DEFAULT NULL            COMMENT '所属组织（模拟面试为NULL）',
  `candidate_id`    BIGINT UNSIGNED DEFAULT NULL            COMMENT '企业候选人ID',
  `candidate_account_id` BIGINT UNSIGNED DEFAULT NULL       COMMENT '求职者账号ID（模拟面试）',
  `position_id`     BIGINT UNSIGNED DEFAULT NULL            COMMENT '目标岗位',
  `resume_id`       BIGINT UNSIGNED DEFAULT NULL            COMMENT '关联简历',
  `bank_id`         BIGINT UNSIGNED DEFAULT NULL            COMMENT '使用的题库',
  `type`            VARCHAR(16)     NOT NULL DEFAULT 'formal' COMMENT 'formal(正式)/mock(模拟)/async(异步)',
  `mode`            VARCHAR(16)     NOT NULL DEFAULT 'ai'   COMMENT 'ai(AI自主)/assist(面试官辅助)',
  `status`          VARCHAR(16)     NOT NULL DEFAULT 'not_started' COMMENT 'not_started/in_progress/paused/completed/expired',
  `dimensions`      JSON            DEFAULT NULL            COMMENT '重点考察维度数组',
  `duration_minutes` INT            NOT NULL DEFAULT 30     COMMENT '面试时长（分钟）',
  `started_at`      DATETIME        DEFAULT NULL,
  `completed_at`    DATETIME        DEFAULT NULL,
  `created_by`      BIGINT UNSIGNED DEFAULT NULL            COMMENT '创建人（企业用户）',
  `interviewer_id`  BIGINT UNSIGNED DEFAULT NULL            COMMENT '面试官（辅助模式）',
  `outline`         TEXT            DEFAULT NULL            COMMENT '面试大纲',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_org_status` (`org_id`, `status`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_candidate_account` (`candidate_account_id`),
  KEY `idx_position` (`position_id`),
  KEY `idx_type_status` (`type`, `status`),
  CONSTRAINT `fk_interviews_org` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_interviews_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_interviews_position` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_interviews_resume` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_interviews_bank` FOREIGN KEY (`bank_id`) REFERENCES `question_banks`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试';

-- 面试消息记录表（全量对话）
CREATE TABLE `interview_messages` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `interview_id`    BIGINT UNSIGNED NOT NULL                COMMENT '面试ID',
  `role`            VARCHAR(16)     NOT NULL                COMMENT '发言人：ai/candidate/interviewer',
  `content`         MEDIUMTEXT      NOT NULL                COMMENT '消息内容',
  `question_id`     BIGINT UNSIGNED DEFAULT NULL            COMMENT '关联题目（AI提问时）',
  `is_streaming`    TINYINT         NOT NULL DEFAULT 0      COMMENT '是否流式输出中',
  `seq`             INT             NOT NULL DEFAULT 0      COMMENT '消息序号',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_interview_seq` (`interview_id`, `seq`),
  KEY `idx_role` (`role`),
  CONSTRAINT `fk_messages_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_question` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试消息记录';

-- =====================================================================
-- 五、评估报告
-- =====================================================================

-- 评估报告表
CREATE TABLE `reports` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `interview_id`    BIGINT UNSIGNED NOT NULL                COMMENT '面试ID',
  `org_id`          BIGINT UNSIGNED DEFAULT NULL,
  `candidate_id`    BIGINT UNSIGNED DEFAULT NULL,
  `candidate_account_id` BIGINT UNSIGNED DEFAULT NULL,
  `overall_score`   DECIMAL(5,2)    DEFAULT NULL            COMMENT '综合分 0-100',
  `radar`           JSON            DEFAULT NULL            COMMENT '能力雷达图 {维度:分数}',
  `question_scores` JSON            DEFAULT NULL            COMMENT '逐题评分数组 [{questionId,aiScore,interviewerScore,comment}]',
  `ai_summary`      TEXT            DEFAULT NULL            COMMENT 'AI 综合评语',
  `improvement_suggestions` TEXT     DEFAULT NULL            COMMENT '改进建议',
  `recommend_level` VARCHAR(24)     DEFAULT NULL            COMMENT 'strongly_recommended/recommended/pending/not_recommended',
  `is_visible_to_candidate` TINYINT  NOT NULL DEFAULT 0      COMMENT '对求职者是否可见',
  `interviewer_comment` TEXT         DEFAULT NULL            COMMENT '面试官批注',
  `pdf_url`         VARCHAR(512)    DEFAULT NULL            COMMENT '报告PDF地址',
  `share_token`     VARCHAR(64)     DEFAULT NULL            COMMENT '分享链接Token',
  `share_expires_at` DATETIME       DEFAULT NULL            COMMENT '分享链接过期时间',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_interview` (`interview_id`),
  KEY `idx_org` (`org_id`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_candidate_account` (`candidate_account_id`),
  KEY `idx_recommend` (`recommend_level`),
  CONSTRAINT `fk_reports_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评估报告';

-- =====================================================================
-- 六、求职者端（C端）
-- =====================================================================

-- 求职者账号表（独立于企业候选人体系）
CREATE TABLE `candidate_accounts` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(64)     NOT NULL                COMMENT '姓名',
  `phone`           VARCHAR(32)     DEFAULT NULL            COMMENT '手机号',
  `email`           VARCHAR(128)    DEFAULT NULL            COMMENT '邮箱',
  `password_hash`   VARCHAR(255)    NOT NULL                COMMENT '密码哈希',
  `avatar_url`      VARCHAR(512)    DEFAULT NULL,
  `intention`       JSON            DEFAULT NULL            COMMENT '求职意向 {position,city,salary,workYears}',
  `status`          TINYINT         NOT NULL DEFAULT 1      COMMENT '1正常 0禁用',
  `last_login_at`   DATETIME        DEFAULT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME        DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='求职者账号';

-- 个人能力档案表（跨场次能力沉淀）
CREATE TABLE `ability_profiles` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `candidate_account_id` BIGINT UNSIGNED NOT NULL           COMMENT '求职者账号ID',
  `current_radar`   JSON            DEFAULT NULL            COMMENT '当前综合能力雷达图 {维度:分数}',
  `total_interviews` INT            NOT NULL DEFAULT 0      COMMENT '累计模拟面试次数',
  `avg_score`       DECIMAL(5,2)    DEFAULT NULL            COMMENT '历史平均分',
  `weak_dimensions` JSON            DEFAULT NULL            COMMENT '短板维度数组',
  `recommended_practice` JSON       DEFAULT NULL            COMMENT '推荐练习方向',
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account` (`candidate_account_id`),
  CONSTRAINT `fk_ability_account` FOREIGN KEY (`candidate_account_id`) REFERENCES `candidate_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人能力档案';

-- 简历测评记录表（C端简历测评）
CREATE TABLE `resume_assess_records` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `candidate_account_id` BIGINT UNSIGNED NOT NULL           COMMENT '求职者账号ID',
  `resume_id`       BIGINT UNSIGNED DEFAULT NULL            COMMENT '关联简历ID',
  `overall_score`   DECIMAL(5,2)    DEFAULT NULL            COMMENT '综合分',
  `radar`           JSON            DEFAULT NULL            COMMENT '6维雷达 {匹配度,完整性,结构,亮点,STAR,关键词}',
  `keyword_hits`    JSON            DEFAULT NULL            COMMENT 'ATS关键词命中报告',
  `improvement_list` JSON           DEFAULT NULL            COMMENT '改进清单',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_account` (`candidate_account_id`),
  KEY `idx_resume` (`resume_id`),
  CONSTRAINT `fk_assess_account` FOREIGN KEY (`candidate_account_id`) REFERENCES `candidate_accounts`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assess_resume` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历测评记录';

-- 简历优化记录表（C端 AI 改简历）
CREATE TABLE `resume_optimize_records` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `candidate_account_id` BIGINT UNSIGNED NOT NULL           COMMENT '求职者账号ID',
  `resume_id`       BIGINT UNSIGNED DEFAULT NULL            COMMENT '关联简历ID',
  `sections`        JSON            DEFAULT NULL            COMMENT '分段优化建议 [{section,original,optimized,rationale,tips}]',
  `full_resume`     MEDIUMTEXT      DEFAULT NULL            COMMENT '优化后完整简历（Markdown）',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_account` (`candidate_account_id`),
  KEY `idx_resume` (`resume_id`),
  CONSTRAINT `fk_optimize_account` FOREIGN KEY (`candidate_account_id`) REFERENCES `candidate_accounts`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_optimize_resume` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历优化记录';

-- =====================================================================
-- 七、异步面试邀请
-- =====================================================================

CREATE TABLE `async_invitations` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `interview_id`    BIGINT UNSIGNED NOT NULL                COMMENT '面试ID',
  `org_id`          BIGINT UNSIGNED NOT NULL,
  `candidate_id`    BIGINT UNSIGNED NOT NULL                COMMENT '企业候选人ID',
  `token`           VARCHAR(255)    NOT NULL                COMMENT '一次性访问Token',
  `valid_from`      DATETIME        NOT NULL                COMMENT '生效时间',
  `valid_until`     DATETIME        NOT NULL                COMMENT '过期时间',
  `device_fingerprint` VARCHAR(128) DEFAULT NULL            COMMENT '首次访问设备指纹（单设备绑定）',
  `first_access_at` DATETIME        DEFAULT NULL            COMMENT '首次访问时间',
  `submitted_at`    DATETIME        DEFAULT NULL            COMMENT '提交完成时间',
  `status`          VARCHAR(16)     NOT NULL DEFAULT 'pending' COMMENT 'pending/accessed/completed/expired',
  `notify_email`    VARCHAR(128)    DEFAULT NULL            COMMENT '邀请通知邮箱',
  `notify_phone`    VARCHAR(32)     DEFAULT NULL            COMMENT '邀请通知手机号',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token` (`token`),
  KEY `idx_interview` (`interview_id`),
  KEY `idx_status` (`status`),
  KEY `idx_valid_until` (`valid_until`),
  CONSTRAINT `fk_async_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_async_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='异步面试邀请';

-- =====================================================================
-- 八、操作审计日志
-- =====================================================================

CREATE TABLE `operation_logs` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `org_id`          BIGINT UNSIGNED DEFAULT NULL,
  `operator_id`     BIGINT UNSIGNED DEFAULT NULL            COMMENT '操作人ID（企业用户）',
  `operator_type`   VARCHAR(16)     DEFAULT NULL            COMMENT 'org_user / candidate_account',
  `action`          VARCHAR(64)     NOT NULL                COMMENT '操作动作',
  `resource_type`   VARCHAR(32)     DEFAULT NULL            COMMENT '资源类型：candidate/interview/report/...',
  `resource_id`     BIGINT UNSIGNED DEFAULT NULL            COMMENT '资源ID',
  `detail`          JSON            DEFAULT NULL            COMMENT '操作详情',
  `ip`              VARCHAR(64)     DEFAULT NULL,
  `user_agent`      VARCHAR(512)    DEFAULT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_org_action` (`org_id`, `action`),
  KEY `idx_resource` (`resource_type`, `resource_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作审计日志';

-- =====================================================================
-- 九、数据字典说明
-- =====================================================================
-- 以下枚举值在应用层维护，数据库通过 VARCHAR 存储以保持灵活性：
--   org_users.role          : super_admin / hr_admin / interviewer / member
--   positions.status        : open / closed / on_hold
--   candidates.status       : pending / interviewing / evaluating / passed / rejected / hold
--   interviews.type         : formal / mock / async
--   interviews.mode         : ai / assist
--   interviews.status       : not_started / in_progress / paused / completed / expired
--   reports.recommend_level : strongly_recommended / recommended / pending / not_recommended
--   questions.question_type : open / scenario / project / behavior
--   async_invitations.status: pending / accessed / completed / expired
