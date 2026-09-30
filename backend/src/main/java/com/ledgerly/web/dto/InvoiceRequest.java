package com.ledgerly.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceRequest(
        @NotNull UUID clientId,
        @NotNull LocalDate issueDate,
        @NotNull LocalDate dueDate,
        @Size(max = 500) String notes,
        @NotEmpty @Valid List<InvoiceItemRequest> items) {}
