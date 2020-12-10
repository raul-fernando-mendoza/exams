package io.javabrains.springsecurityjpa;

import io.javabrains.springsecurityjpa.models.User;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.javabrains.springsecurityjpa.models.MyUserDetails;
import io.javabrains.springsecurityjpa.models.Role;
import io.javabrains.springsecurityjpa.models.User;

@RestController
public class LoginRestController {
	
    @Autowired
    UserRepository userRepository;
    
	static final Logger log = 
	        LoggerFactory.getLogger(LoginRestController.class);	

	@CrossOrigin(origins = "http://localhost:4200")
	@GetMapping("/loginService")
	public MyUserDetails[] login(@RequestParam(name="username", required=true, defaultValue="") String username, @RequestParam(name="password", required=true, defaultValue="") String password, Model model) {
		log.info("login for user {}", username);
		log.info("password for user {}", password);
		
		Optional<User> optionalUser = userRepository.findByUsername(username);
		MyUserDetails userDetails = null;
		
		log.info("login for user found {}",optionalUser.isPresent());
		
		if( optionalUser.isPresent() ) {
			
			log.debug("Login user found:" + optionalUser.get().getUsername() + " " + optionalUser.get().getPassword());
			
			if ( password.equals(optionalUser.get().getPassword()) ) {
				
				User user = optionalUser.get();
			
				userDetails = new MyUserDetails(user);
				
				UUID uuid = TokenPool.createToken();
				
				userDetails.setToken(uuid);
				TokenPool.storeToken(uuid, userDetails);
	
			    Authentication authentication =
			            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
			    
			    SecurityContextHolder.getContext().setAuthentication(authentication);
			    
			    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			    log.info("new principal {}", principal);
			        
			}
			else {

				SecurityContextHolder.getContext().setAuthentication(null);
				log.warn( "Login incorrect password" );				
			}			
		}
		else {
			SecurityContextHolder.getContext().setAuthentication(null);
			log.warn( "login username incorrect" );
		}
		MyUserDetails userArray[] = new MyUserDetails[1];
		userArray[0] = userDetails;
		return userArray;
    }
	
	@CrossOrigin(origins = "http://localhost:4200")
	@GetMapping("/logoutService")
	String[] logout(){
		SecurityContextHolder.getContext().setAuthentication(null);
		String[] logout = {"logout"};
		return  logout;
	}
	

}

