-- ============================================================
-- check-cx 初始监控数据导入脚本
-- 从 relay-pulse monitors.d 迁移 + 官方端点
--
-- 在 Supabase 控制台 → SQL Editor 中执行
-- 注意：请先执行 schema.sql 初始化表结构
-- ============================================================

-- ------------------------------------------------------------
-- 第一步：创建模型定义
-- ------------------------------------------------------------
INSERT INTO check_models (type, model)
VALUES
  -- 中转服务使用的模型（openai type = 走 /v1/chat/completions）
  ('openai', 'claude-sonnet-4-6'),
  ('openai', 'gpt-5.4'),
  -- 官方模型备用
  ('openai', 'gpt-4o-mini'),
  ('openai', 'gpt-4o'),
  ('anthropic', 'claude-3-5-haiku-20241022'),
  ('anthropic', 'claude-sonnet-4-5'),
  ('gemini', 'gemini-2.0-flash')
ON CONFLICT (type, model) DO NOTHING;

-- ------------------------------------------------------------
-- 第二步：创建分组信息
-- ------------------------------------------------------------
INSERT INTO group_info (group_name, website_url, tags)
VALUES
  ('灵枢API - Claude', 'https://tcp.red', 'relay,claude,self-hosted'),
  ('灵枢API - ChatGPT', 'https://tcp.red', 'relay,openai,self-hosted')
ON CONFLICT (group_name) DO NOTHING;

-- ------------------------------------------------------------
-- 第三步：从 relay-pulse 迁移的监控配置
-- 来源：/home/ubuntu/relay-pulse/config/monitors.d/
-- ------------------------------------------------------------

-- tcp-red / cc / claude-max-external-version（MAX 可外接版）
INSERT INTO check_configs (name, type, model_id, endpoint, api_key, enabled, group_name)
SELECT
  'MAX 可外接版',
  'openai',
  id,
  'https://api.tcp.red/v1/chat/completions',
  'sk-sbWZcFsIDrJ3lhjgsg22FfOnzgJOoEqlMo6ULmbjvHMOg5Ng',
  true,
  '灵枢API - Claude'
FROM check_models WHERE type = 'openai' AND model = 'claude-sonnet-4-6';

-- tcp-red / cc / claude-reverse-low-latency-cache（逆向低延迟高缓存）
INSERT INTO check_configs (name, type, model_id, endpoint, api_key, enabled, group_name)
SELECT
  '逆向低延迟高缓存',
  'openai',
  id,
  'https://api.tcp.red/v1/chat/completions',
  'sk-W3RQMfvSY7ptsxyawwGquxwhYW4XQj0FBVNdtgA4FDIpNhqR',
  true,
  '灵枢API - Claude'
FROM check_models WHERE type = 'openai' AND model = 'claude-sonnet-4-6';

-- tcp-red / cc / claude-reverse（逆向）
INSERT INTO check_configs (name, type, model_id, endpoint, api_key, enabled, group_name)
SELECT
  '逆向',
  'openai',
  id,
  'https://api.tcp.red/v1/chat/completions',
  'sk-aCIhgiRrBkv0IQ9KkgOssl3hhiod34Ov6aCviaBp6kLwDcNL',
  true,
  '灵枢API - Claude'
FROM check_models WHERE type = 'openai' AND model = 'claude-sonnet-4-6';

-- tcp-red / cc / claude-small-pool（小血池）
INSERT INTO check_configs (name, type, model_id, endpoint, api_key, enabled, group_name)
SELECT
  '小血池',
  'openai',
  id,
  'https://api.tcp.red/v1/chat/completions',
  'sk-bJnzarakEcaL1XXz6iRtdCa0cdQ7a7ZXiUc7WwgleCQX0JVo',
  true,
  '灵枢API - Claude'
FROM check_models WHERE type = 'openai' AND model = 'claude-sonnet-4-6';

-- tcp-red / cx / chatgpt（ChatGPT）
INSERT INTO check_configs (name, type, model_id, endpoint, api_key, enabled, group_name)
SELECT
  'ChatGPT',
  'openai',
  id,
  'https://api.tcp.red/v1/chat/completions',
  'sk-GKrf3JblqVlKqcgSfd5PAXW8rlPASHFY5OImjFRVTVHrW9Gb',
  true,
  '灵枢API - ChatGPT'
FROM check_models WHERE type = 'openai' AND model = 'gpt-5.4';
