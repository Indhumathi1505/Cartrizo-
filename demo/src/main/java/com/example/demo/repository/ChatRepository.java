package com.example.demo.repository;

import com.example.demo.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatRepository extends MongoRepository<ChatMessage, String> {
   List<ChatMessage> findByCarIdOrderByTimestampAsc(String carId);
   
   List<ChatMessage> findBySellerEmail(String sellerEmail);
   
   List<ChatMessage> findByCarIdAndSellerEmailAndBuyerEmailOrderByTimestampAsc(
       String carId,
       String sellerEmail,
       String buyerEmail
   );

}
