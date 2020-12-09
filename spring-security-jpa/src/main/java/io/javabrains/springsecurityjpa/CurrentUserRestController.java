package io.javabrains.springsecurityjpa;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.javabrains.springsecurityjpa.models.MyUserDetails;

@RestController
public class CurrentUserRestController{
	static final Logger log = 
	        LoggerFactory.getLogger(CurrentUserRestController.class);	
	@CrossOrigin(origins = "http://localhost:4200")
	@GetMapping("/currentUserService")
    public static MyUserDetails[] getCurrentUser(@RequestParam(name="token", required=true, defaultValue="") String token) {
		MyUserDetails users[] = new MyUserDetails[0];
		log.info("currentUser called with token:{}", token);
		try {
			UUID uuid = UUID.fromString(token);
			MyUserDetails user = TokenPool.getUser(uuid);
			if(user != null) {
				users = new MyUserDetails[1];
				users[0] = user;
			}
			
		}
		catch( IllegalArgumentException  e) {
			log.error("token ilegal");
			return new MyUserDetails[0];
		}
    	return users;
    }

}

