package com.fidelix.backend.repo;

import com.fidelix.backend.model.MonthlyCounter;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CounterRepo extends JpaRepository<MonthlyCounter, String> {

  @Modifying
  @Transactional
  @Query(value = """
    insert into monthly_counters(key, current_value)
    values (:key, 1)
    on conflict (key)
    do update set current_value = monthly_counters.current_value + 1, updated_at = now()
    """, nativeQuery = true)
  void upsertAndIncrement(@Param("key") String key);

  @Query(value = "select current_value from monthly_counters where key = :key", nativeQuery = true)
  Integer getCurrentValue(@Param("key") String key);
}
