package com.ledgerly.repository;

import com.ledgerly.domain.Invoice;
import com.ledgerly.domain.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Query("""
            select distinct i from Invoice i
            join fetch i.client
            left join fetch i.items
            where i.id = :id and i.owner.id = :ownerId
            """)
    Optional<Invoice> findByIdAndOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    @Query("""
            select i from Invoice i
            join fetch i.client
            where i.owner.id = :ownerId
              and (:status is null or i.status = :status)
              and (:clientId is null or i.client.id = :clientId)
              and (:fromDate is null or i.issueDate >= :fromDate)
              and (:toDate is null or i.issueDate <= :toDate)
            order by i.issueDate desc, i.number desc
            """)
    List<Invoice> findFiltered(
            @Param("ownerId") UUID ownerId,
            @Param("status") InvoiceStatus status,
            @Param("clientId") UUID clientId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    @Query("""
            select coalesce(max(cast(substring(i.number, length(i.number) - 2, 3) as int)), 0)
            from Invoice i
            where i.owner.id = :ownerId
              and i.number like concat('FV/', :year, '/%')
            """)
    int findMaxSequenceForYear(@Param("ownerId") UUID ownerId, @Param("year") int year);

    @Query("""
            select coalesce(sum(i.grossTotal), 0) from Invoice i
            where i.owner.id = :ownerId
              and i.status <> com.ledgerly.domain.InvoiceStatus.CANCELLED
              and i.issueDate >= :fromDate and i.issueDate <= :toDate
            """)
    BigDecimal sumIssuedGross(
            @Param("ownerId") UUID ownerId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    @Query("""
            select coalesce(sum(i.grossTotal), 0) from Invoice i
            where i.owner.id = :ownerId
              and i.status = com.ledgerly.domain.InvoiceStatus.PAID
              and i.issueDate >= :fromDate and i.issueDate <= :toDate
            """)
    BigDecimal sumPaidGross(
            @Param("ownerId") UUID ownerId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    @Query("""
            select coalesce(sum(i.grossTotal), 0) from Invoice i
            where i.owner.id = :ownerId
              and i.status = com.ledgerly.domain.InvoiceStatus.SENT
              and i.issueDate >= :fromDate and i.issueDate <= :toDate
            """)
    BigDecimal sumOutstandingGross(
            @Param("ownerId") UUID ownerId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    @Query("""
            select i from Invoice i
            join fetch i.client
            where i.owner.id = :ownerId
              and i.status = com.ledgerly.domain.InvoiceStatus.SENT
              and i.dueDate >= :today
              and i.dueDate <= :until
            order by i.dueDate asc
            """)
    List<Invoice> findUpcomingDue(
            @Param("ownerId") UUID ownerId,
            @Param("today") LocalDate today,
            @Param("until") LocalDate until);
}
