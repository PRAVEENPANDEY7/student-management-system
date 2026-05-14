package org.studentmanagementsystem.repository;

import org.studentmanagementsystem.entity.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
}