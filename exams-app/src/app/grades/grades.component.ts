import { Component, OnInit, Injectable, Input } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';
import { ExamGrade, ExamGradeMultipleRequest, ExamGradeRequest } from '../exams/exams.module';
import {  Router } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

/**
 * Node for to-do item
 */
 export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
  score: Number;
  exam_id:string;
  parameter_id:string;
  released: boolean;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  score:Number;
  level: number;
  exam_id:string;
  parameter_id:string;  
  expandable: boolean;
}



/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize(null);
  }

  initialize(exam:ExamGrade) {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    //const data = this.buildFileTree(TREE_DATA, 0);
    const data = []

    if( exam != null){

      var p:TodoItemNode = {
        item:exam.title, 
        released:true, 
        score:exam.score, 
        exam_id:exam.id,
        parameter_id:null,
        children:[]
      }
      var total = 0.0
      exam.parameterGrades.forEach( parameter => {
                                    p.children.push({
                                      item:parameter.label, 
                                      score:parameter.score, 
                                      released:true, 
                                      exam_id:exam.id,
                                      parameter_id:parameter.id,
                                      children:[]});
                                      total = total + parameter.score
                                    }
                                  )
      p.score = Number((total / p.children.length).toFixed(2))
      data.push( p )
    }
   
    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  /*
  buildFileTree(obj: {[key: string]: any}, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }
*/
  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({item: name} as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}


@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css'],
  providers: [ChecklistDatabase],
})
export class GradesComponent implements OnInit {

  @Input() exam: ExamGrade;
  
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  constructor(
     private _database: ChecklistDatabase
    ,private router: Router
    ,private examImprovisacionService: ExamenesImprovisacionService
    ,private userLoginService:UserLoginService
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
   }
   getLevel = (node: TodoItemFlatNode) => node.level;

   isExpandable = (node: TodoItemFlatNode) => node.expandable;
 
   getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;
 
   hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;
 
   hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';
 
   /**
    * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
    */
   transformer = (node: TodoItemNode, level: number) => {
     const existingNode = this.nestedNodeMap.get(node);
     const flatNode =
       existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
     flatNode.item = node.item;
     flatNode.score = node.score;
     flatNode.level = level;
     flatNode.exam_id = node.exam_id
     flatNode.parameter_id = node.parameter_id
     flatNode.expandable = !!node.children?.length;
     this.flatNodeMap.set(flatNode, node);
     this.nestedNodeMap.set(node, flatNode);
     return flatNode;
   };
 
   /** Whether all the descendants of the node are selected. */
   isSelected(node: TodoItemFlatNode): boolean {
    const nestedNode = this.flatNodeMap.get(node);

     return nestedNode.released;
   }
 

 
   /** Toggle the to-do item selection. Select/deselect all the descendants node */
   todoItemSelectionToggle(node: TodoItemFlatNode): void {
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.released = true
     this.checklistSelection.toggle(node);
   }
 
   /** Save the node to database */
   saveNode(node: TodoItemFlatNode, itemValue: string) {
     const nestedNode = this.flatNodeMap.get(node);
     this._database.updateItem(nestedNode!, itemValue);
   }

  ngOnInit(): void {
    console.debug( this.exam ) 
    this._database.initialize( this.exam )
  }

  onEdit(examGrade_id, parameterGrade_id){
    this.router.navigate(['/ei-ap-parameter-form-component',{examGrade_id:examGrade_id,parameterGrade_id:parameterGrade_id}]);
  }  

  onClean(examGrade_id, parameterGrade_id){



    var req:ExamGradeRequest={
      examGrades:{
        id:examGrade_id,
        score:null,
        title:null,
        parameterGrades:[{
          id: parameterGrade_id,
          score:null,
          completed:null,
          evaluator_comment:null,
          label:null,
          criteriaGrades:[{
            id:null,
            score:null,
            aspectGrades:[{
              id:null,
              score:null,
              missingElements:null
            }]
          }]
        }]
      }
    }


    var startTime =  new Date().getTime();

    this.userLoginService.getUserIdToken()
    .then( token => this.examImprovisacionService.firestoreApiInterface("get", token, req).toPromise() )
    .then( result => this.cleanAll( result["result"] ) )
    .catch( error => { alert("Error in token:" + error.errorCode + " " + error.errorMessage) })
      
  } 

  replacerScore(key, value:[]) {
    // Filtrando propiedades 
    if (key === "score") {
      return 1
    }
    if (key === "missingElements") {
      return ""
    }
    if (key === "evaluator_comment") {
      return ""
    }

    return value;
  }    

  cleanAll(result){



    var e:ExamGrade = JSON.parse( JSON.stringify(result, this.replacerScore, 4) )

    if( !confirm("Esta seguro de querer limpiar el parametro:" + e.title + " " + e.parameterGrades[0].label) ){
      return
    }

    e.completed = false
    e.released = false
    e.parameterGrades[0].completed = false

    console.log(  JSON.stringify(e, null, 4) )

    var req:ExamGradeRequest = {
      examGrades:e
    }

    this.userLoginService.getUserIdToken()
    .then( token => this.examImprovisacionService.firestoreApiInterface("update", token, req).toPromise() )
    .then( result => alert("exam was cleaned")  )
    .catch( error => { alert("Error in token:" + error.errorCode + " " + error.errorMessage) })


  }

}
