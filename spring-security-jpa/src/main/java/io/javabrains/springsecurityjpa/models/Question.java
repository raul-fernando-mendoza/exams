package io.javabrains.springsecurityjpa.models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String question_name;
    private String question_description;
    private Double grade;
	public Double getGrade() {
		return grade;
	}
	public void setGrade(Double grade) {
		this.grade = grade;
	}
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getQuestion_name() {
		return question_name;
	}
	public void setQuestion_name(String question_name) {
		this.question_name = question_name;
	}
	public String getQuestion_description() {
		return question_description;
	}
	public void setQuestion_description(String question_description) {
		this.question_description = question_description;
	}
    
}
