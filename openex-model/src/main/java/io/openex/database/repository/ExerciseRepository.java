package io.openex.database.repository;

import io.openex.database.model.Exercise;
import javax.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends CrudRepository<Exercise, String>, StatisticRepository {

    @NotNull
    Optional<Exercise> findById(@NotNull String id);

    @Query(value = "select e from Exercise e where e.status = 'SCHEDULED' and e.start <= :start")
    List<Exercise> findAllShouldBeInRunningState(@Param("start") Instant start);

    @Query("select distinct e from Exercise e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId")
    List<Exercise> findAllGranted(@Param("userId") String userId);

    @Override
    @Query("select count(distinct e) from Exercise e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId and e.createdAt < :creationDate")
    long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

    @Override
    @Query("select count(distinct e) from Exercise e where e.createdAt < :creationDate")
    long globalCount(@Param("creationDate") Instant creationDate);

    @Query(value = "select e.* from exercises e " +
            "left join injects as inject on e.exercise_id = inject.inject_exercise " +
            "left join injects_statuses as status on inject.inject_id = status.status_inject " +
            "where e.exercise_status = 'RUNNING' group by e.exercise_id having count(status) = count(inject);", nativeQuery = true)
    List<Exercise> thatMustBeFinished();
}
