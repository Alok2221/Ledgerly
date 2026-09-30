package com.ledgerly.web.dto;

import java.time.Instant;
import java.util.UUID;

public record ClientResponse(
        UUID id,
        String name,
        String nip,
        String email,
        String address,
        Instant createdAt,
        Instant updatedAt) {}
