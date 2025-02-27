package io.openex.database.repository;

import io.openex.database.model.Token;
import javax.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRepository extends CrudRepository<Token, String>, JpaSpecificationExecutor<Token> {

    @NotNull
    Optional<Token> findById(@NotNull String id);

    Optional<Token> findByValue(String value);
}
