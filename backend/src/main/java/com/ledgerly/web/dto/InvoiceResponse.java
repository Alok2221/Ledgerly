package com.ledgerly.web.dto;

import com.ledgerly.domain.InvoiceStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        String number,
        InvoiceStatus status,
        UUID clientId,
        String clientName,
        LocalDate issueDate,
        LocalDate dueDate,
        BigDecimal netTotal,
        BigDecimal vatTotal,
        BigDecimal grossTotal,
        String notes,
        List<InvoiceItemResponse> items,
        Instant createdAt,
        Instant updatedAt) {}
