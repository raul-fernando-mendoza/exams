import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateFormatService } from '../date-format.service';

interface DateSelection{
  id:number|null
  displayName:string
}

@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.css']
})
export class DateSelectorComponent implements OnInit {

  @Input() value:string  
  @Output() change = new EventEmitter<number>()

  selectedDay = null
  filterDays:Array<DateSelection> = []
  constructor(
    private dateFormatService:DateFormatService
  ) { 
  }

  
  ngOnInit(): void {

    if( this.value){
      this.selectedDay = this.value
    }    

    this.filterDays.length = 0 

    this.filterDays.push({"id":null,"displayName":"-"})

    const today = new Date()
    const todayId = this.dateFormatService.getDayId( today )
    this.filterDays.push( { "id":todayId, "displayName":"Hoy"})

    const yesterday = new Date()
    yesterday.setDate( today.getDate() - 1 )    
    const yesterdayId = this.dateFormatService.getDayId( yesterday )
    this.filterDays.push( { "id":yesterdayId, "displayName":"Ayer"})
    
    const monthId = this.dateFormatService.getMonthId( today )
    this.filterDays.push( { "id":monthId, "displayName":"Mes"})

    const yearId = this.dateFormatService.getYearId( today )
    this.filterDays.push( { "id":yearId, "displayName":"Año"})

    this.filterDays.push( { "id":yearId-1, "displayName":"Año Anterior"})


  }

  onDateChange($event){
    console.log("event:" + $event.value)
    this.change.emit(this.selectedDay)
  }

}
