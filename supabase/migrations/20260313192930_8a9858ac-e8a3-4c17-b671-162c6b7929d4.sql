DELETE FROM community_posts WHERE url ~ '/comments/\d{5,}/';
DELETE FROM use_cases WHERE url ~ '/comments/\d{5,}/';