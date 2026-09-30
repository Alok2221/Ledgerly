package com.ledgerly.web;

import com.ledgerly.domain.InvoiceStatus;
import com.ledgerly.security.CurrentUser;
import com.ledgerly.service.InvoiceService;
import com.ledgerly.web.dto.InvoiceRequest;
import com.ledgerly.web.dto.InvoiceResponse;
import com.ledgerly.web.dto.InvoiceStatusRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public List<InvoiceResponse> list(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return invoiceService.list(CurrentUser.require().getId(), status, clientId, from, to);
    }

    @GetMapping("/{id}")
    public InvoiceResponse get(@PathVariable UUID id) {
        return invoiceService.get(CurrentUser.require().getId(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(@Valid @RequestBody InvoiceRequest request) {
        return invoiceService.create(CurrentUser.require().getId(), request);
    }

    @PutMapping("/{id}")
    public InvoiceResponse update(@PathVariable UUID id, @Valid @RequestBody InvoiceRequest request) {
        return invoiceService.update(CurrentUser.require().getId(), id, request);
    }

    @PutMapping("/{id}/status")
    public InvoiceResponse changeStatus(
            @PathVariable UUID id, @Valid @RequestBody InvoiceStatusRequest request) {
        return invoiceService.changeStatus(CurrentUser.require().getId(), id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        invoiceService.delete(CurrentUser.require().getId(), id);
    }
}
