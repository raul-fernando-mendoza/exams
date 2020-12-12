package io.javabrains.springsecurityjpa;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.javabrains.springsecurityjpa.models.UserLoginCredentials;

@RestController
public class CurrentUserRestController{
	static final Logger log = 
	        LoggerFactory.getLogger(CurrentUserRestController.class);	
	@CrossOrigin(origins = "http://localhost:4200")
	@GetMapping("/currentUserService")
    public static UserLoginCredentials getCurrentUser(@RequestParam(name="token", required=true, defaultValue="") String token) {
		UserLoginCredentials user = null;
		log.info("currentUser called with token:{}", token);
		try {
			UUID uuid = UUID.fromString(token);
			user = TokenPool.getUser(uuid);
			
			
		}
		catch( IllegalArgumentException  e) {
			log.error("token ilegal");
			return null;
		}
    	return user;
    }

}

