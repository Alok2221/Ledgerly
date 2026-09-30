package com.ledgerly.repository;

import com.ledgerly.domain.Client;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    List<Client> findByOwnerIdOrderByNameAsc(UUID ownerId);

    Optional<Client> findByIdAndOwnerId(UUID id, UUID ownerId);

    @Query("""
            select c from Client c
            where c.owner.id = :ownerId
              and lower(c.name) like lower(concat('%', :query, '%'))
            order by c.name asc
            """)
    List<Client> searchByOwnerAndName(@Param("ownerId") UUID ownerId, @Param("query") String query);

    boolean existsByIdAndOwnerId(UUID id, UUID ownerId);
}
