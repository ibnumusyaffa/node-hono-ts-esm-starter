DELIMITER $$

CREATE PROCEDURE truncate_all_tables_proc()
BEGIN
  DECLARE done     INT DEFAULT 0;
  DECLARE tname    VARCHAR(64);

  DECLARE c CURSOR FOR
    SELECT table_name
    FROM   information_schema.tables
    WHERE  table_schema = DATABASE()
      AND  table_name NOT IN ('kysely_migration','kysely_migration_lock')
      AND  table_type   = 'BASE TABLE';

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SET SESSION FOREIGN_KEY_CHECKS = 0;

  OPEN c;
  loop_truncate: LOOP
      FETCH c INTO tname;
      IF done THEN
          LEAVE loop_truncate;
      END IF;
      SET @sql = CONCAT('TRUNCATE TABLE `', tname, '`');
      PREPARE stmt FROM @sql;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
  END LOOP;
  CLOSE c;

  SET SESSION FOREIGN_KEY_CHECKS = 1;
END$$
DELIMITER ;