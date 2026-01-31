package com.example.demo.controller;

import com.example.demo.model.ChatMessage;
import com.example.demo.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private ChatRepository chatRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private String safe(String email) {
        if (email == null) return "unknown";
        return email.toLowerCase().replace(".", "_");
    }

    /* ---------------- LOAD CHAT FOR A CAR ---------------- */
    @GetMapping("/{carId}")
    public List<ChatMessage> loadChat(@PathVariable String carId) {
        return chatRepo.findByCarIdOrderByTimestampAsc(carId);
    }

    /* ---------------- WEBSOCKET SEND MESSAGE ---------------- */
    @MessageMapping("/chat/{carId}")
    public void sendMessage(
            @DestinationVariable String carId,
            @Payload ChatMessage message
    ) {
        System.out.println("📩 WS message for car: " + carId + " from: " + message.getSender());

        if (message.getBuyerEmail() == null || message.getSellerEmail() == null) {
            System.out.println("❌ ERROR: Missing buyer/seller email");
            return;
        }

        // Enforce lowercase
        message.setCarId(carId);
        message.setBuyerEmail(message.getBuyerEmail().toLowerCase());
        message.setSellerEmail(message.getSellerEmail().toLowerCase());
        message.setSender(message.getSender().toLowerCase());
        message.setTimestamp(LocalDateTime.now());

        chatRepo.save(message);

        String sellerTopic = "/topic/chat/" + carId + "/" + safe(message.getSellerEmail());
        String buyerTopic = "/topic/chat/" + carId + "/" + safe(message.getBuyerEmail());

        messagingTemplate.convertAndSend(sellerTopic, message);
        messagingTemplate.convertAndSend(buyerTopic, message);
    }

    /* ---------------- SELLER INBOX ---------------- */
    @GetMapping("/seller/{sellerEmail}")
    public Map<String, Set<String>> sellerInbox(@PathVariable String sellerEmail) {
        String lowSeller = sellerEmail.toLowerCase();
        Map<String, Set<String>> inbox = new HashMap<>();

        // Use the new optimized method
        List<ChatMessage> msgs = chatRepo.findBySellerEmail(lowSeller);

        for (ChatMessage m : msgs) {
            inbox
              .computeIfAbsent(m.getCarId(), k -> new HashSet<>())
              .add(m.getBuyerEmail());
        }
        return inbox;
    }

    @GetMapping("/buyer")
    public List<ChatMessage> loadBuyerChat(
        @RequestParam String carId,
        @RequestParam String sellerEmail,
        @RequestParam String buyerEmail
    ) {
        return chatRepo.findByCarIdAndSellerEmailAndBuyerEmailOrderByTimestampAsc(
            carId, 
            sellerEmail.toLowerCase(), 
            buyerEmail.toLowerCase()
        );
    }
}