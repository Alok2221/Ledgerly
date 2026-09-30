package com.ledgerly.service;

import com.ledgerly.domain.Client;
import com.ledgerly.domain.Invoice;
import com.ledgerly.domain.InvoiceItem;
import com.ledgerly.domain.InvoiceStatus;
import com.ledgerly.domain.User;
import com.ledgerly.exception.BadRequestException;
import com.ledgerly.exception.NotFoundException;
import com.ledgerly.repository.InvoiceRepository;
import com.ledgerly.repository.UserRepository;
import com.ledgerly.web.dto.InvoiceItemRequest;
import com.ledgerly.web.dto.InvoiceItemResponse;
import com.ledgerly.web.dto.InvoiceRequest;
import com.ledgerly.web.dto.InvoiceResponse;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class InvoiceService {

    private static final Map<InvoiceStatus, Set<InvoiceStatus>> ALLOWED_TRANSITIONS = Map.of(
            InvoiceStatus.DRAFT, EnumSet.of(InvoiceStatus.SENT, InvoiceStatus.CANCELLED),
            InvoiceStatus.SENT, EnumSet.of(InvoiceStatus.PAID, InvoiceStatus.CANCELLED),
            InvoiceStatus.PAID, EnumSet.noneOf(InvoiceStatus.class),
            InvoiceStatus.CANCELLED, EnumSet.noneOf(InvoiceStatus.class));

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final ClientService clientService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            UserRepository userRepository,
            ClientService clientService) {
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
        this.clientService = clientService;
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> list(
            UUID ownerId, InvoiceStatus status, UUID clientId, java.time.LocalDate from, java.time.LocalDate to) {
        return invoiceRepository.findFiltered(ownerId, status, clientId, from, to).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse get(UUID ownerId, UUID invoiceId) {
        return toResponse(requireOwned(ownerId, invoiceId));
    }

    @Transactional
    public InvoiceResponse create(UUID ownerId, InvoiceRequest request) {
        User owner = userRepository
                .findById(ownerId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Client client = clientService.requireOwned(ownerId, request.clientId());
        validateDates(request);

        Invoice invoice = new Invoice();
        invoice.setOwner(owner);
        invoice.setClient(client);
        invoice.setNumber(nextNumber(ownerId, request.issueDate().getYear()));
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setIssueDate(request.issueDate());
        invoice.setDueDate(request.dueDate());
        invoice.setNotes(blankToNull(request.notes()));
        invoice.replaceItems(mapItems(request.items()));
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse update(UUID ownerId, UUID invoiceId, InvoiceRequest request) {
        Invoice invoice = requireOwned(ownerId, invoiceId);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT invoices can be edited");
        }
        validateDates(request);
        Client client = clientService.requireOwned(ownerId, request.clientId());
        invoice.setClient(client);
        invoice.setIssueDate(request.issueDate());
        invoice.setDueDate(request.dueDate());
        invoice.setNotes(blankToNull(request.notes()));
        invoice.replaceItems(mapItems(request.items()));
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse changeStatus(UUID ownerId, UUID invoiceId, InvoiceStatus newStatus) {
        Invoice invoice = requireOwned(ownerId, invoiceId);
        Set<InvoiceStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(invoice.getStatus(), Set.of());
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException(
                    "Illegal status transition: " + invoice.getStatus() + " → " + newStatus);
        }
        invoice.setStatus(newStatus);
        return toResponse(invoice);
    }

    @Transactional
    public void delete(UUID ownerId, UUID invoiceId) {
        Invoice invoice = requireOwned(ownerId, invoiceId);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT invoices can be deleted");
        }
        invoiceRepository.delete(invoice);
    }

    private Invoice requireOwned(UUID ownerId, UUID invoiceId) {
        return invoiceRepository
                .findByIdAndOwnerId(invoiceId, ownerId)
                .orElseThrow(() -> new NotFoundException("Invoice not found"));
    }

    private String nextNumber(UUID ownerId, int year) {
        int seq = invoiceRepository.findMaxSequenceForYear(ownerId, year) + 1;
        return "FV/%d/%03d".formatted(year, seq);
    }

    private void validateDates(InvoiceRequest request) {
        if (request.dueDate().isBefore(request.issueDate())) {
            throw new BadRequestException("Due date cannot be earlier than issue date");
        }
    }

    private List<InvoiceItem> mapItems(List<InvoiceItemRequest> requests) {
        return requests.stream()
                .map(req -> {
                    InvoiceItem item = new InvoiceItem();
                    item.setDescription(req.description().trim());
                    item.setQuantity(req.quantity());
                    item.setUnitNetPrice(req.unitNetPrice());
                    item.setVatRate(req.vatRate());
                    return item;
                })
                .toList();
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        List<InvoiceItemResponse> items = invoice.getItems().stream()
                .map(item -> new InvoiceItemResponse(
                        item.getId(),
                        item.getDescription(),
                        item.getQuantity(),
                        item.getUnitNetPrice(),
                        item.getVatRate(),
                        item.getLineNet(),
                        item.getLineVat(),
                        item.getLineGross()))
                .toList();
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getNumber(),
                invoice.getStatus(),
                invoice.getClient().getId(),
                invoice.getClient().getName(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                invoice.getNetTotal(),
                invoice.getVatTotal(),
                invoice.getGrossTotal(),
                invoice.getNotes(),
                items,
                invoice.getCreatedAt(),
                invoice.getUpdatedAt());
    }
}
