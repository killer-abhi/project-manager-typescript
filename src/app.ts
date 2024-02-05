// Project
enum ProjectStatus {
	Active,
	Finished,
}

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus
	) {}
}

//Project State Management

// type Listener = (items: Project[]) => void;
type Listener<T> = (items: T[]) => void;

class State<T>{
	protected listeners: Listener<T>[] = [];
	public addListener(ListenerFn: Listener<T>) {
		console.log(ListenerFn);
		this.listeners.push(ListenerFn);
	}
}

class ProjectState extends State<Project> {
	// private listeners: Listener[] = [];
	private projects: Project[] = [];
	private static instance: ProjectState;

	private constructor() {
		super();
	}
	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}
	// public addListener(ListenerFn: Listener) {
	// 	console.log(ListenerFn);
	// 	this.listeners.push(ListenerFn);
	// }
	public addProject(title: string, descritpion: string, numOfPeople: number) {
		const newProject = new Project(
			Math.random().toString(),
			title,
			descritpion,
			numOfPeople,
			ProjectStatus.Active
		);
		this.projects.push(newProject);
		for (const listenerFn of this.listeners) {
			listenerFn(this.projects.slice());
		}
	}
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}
function validate(validatableInput: Validatable) {
	let isValid = true;
	if (validatableInput.required) {
		isValid = isValid && validatableInput.value.toString().trim().length !== 0;
	}
	if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
		isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
	}
	if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
		isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
	}
	if (validatableInput.min != null && typeof validatableInput.value === "number") {
		isValid = isValid && validatableInput.value >= validatableInput.min;
	}
	if (validatableInput.max != null && typeof validatableInput.value === "number") {
		isValid = isValid && validatableInput.value <= validatableInput.max;
	}
	return isValid;
}

//autobind decorator
function autobind(_1: any, _2: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		get() {
			const boundFn = originalMethod.bind(this);
			return boundFn;
		},
	};
	return adjDescriptor;
}

//Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart:boolean,
		newElementId?: string
	) {
		this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;

		const importedNode = document.importNode(this.templateElement.content, true);
		this.element = importedNode.firstElementChild as U;
		if (newElementId) {
			this.element.id = newElementId;
		}
		this.attach(insertAtStart);
	}
	private attach(insertAtStart:boolean) {
		this.hostElement.insertAdjacentElement(insertAtStart?'afterbegin':'beforeend', this.element);
	}
	abstract configure():void;
	abstract renderContent():void;

}

// Project list class
class ProjectList extends Component<HTMLDivElement,HTMLElement>{
	// templateElement: HTMLTemplateElement;
	// hostElement: HTMLDivElement;
	// element: HTMLElement;
	assignedProjects: Project[];

	constructor(private type: "active" | "finished") {
		super('project-list','app',false,`${type}-projects`);
		// this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
		// this.hostElement = document.getElementById("app")! as HTMLDivElement;

		this.assignedProjects = [];

		// const importedNode = document.importNode(this.templateElement.content, true);
		// this.element = importedNode.firstElementChild as HTMLElement;
		// this.element.id = `${this.type}-projects`;

		// projectState.addListener((projects: Project[]) => {
		// 	const relevantProjects = projects.filter((prj) => {
		// 		if (this.type === "active") {
		// 			return prj.status === ProjectStatus.Active;
		// 		} else {
		// 			return prj.status === ProjectStatus.Finished;
		// 		}
		// 	});
		// 	console.log(relevantProjects.length);
		// 	this.assignedProjects = relevantProjects;
		// 	this.renderProjects();
		// });
		this.configure();
		this.renderContent();
		// this.attach();
	}
	private renderProjects() {
		const listElement = document.getElementById(`${this.type}-projects-list`);
		listElement!.innerHTML = "";
		console.log(this.assignedProjects.length);
		for (const prjItem of this.assignedProjects) {
			const listItem = document.createElement("li");
			listItem.textContent = prjItem.title;
			listElement!.appendChild(listItem);
		}
	}
	configure(){
		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter((prj) => {
				if (this.type === "active") {
					return prj.status === ProjectStatus.Active;
				} else {
					return prj.status === ProjectStatus.Finished;
				}
			});
			console.log(relevantProjects.length);
			this.assignedProjects = relevantProjects;
			this.renderProjects();
		});
	}
	renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector("ul")!.id = listId;
		this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
	}
	// private attach() {
	// 	this.hostElement.insertAdjacentElement("beforeend", this.element);
	// }
}

class ProjectInput extends Component<HTMLDivElement,HTMLFormElement> {
	// templateElement: HTMLTemplateElement;
	// hostElement: HTMLDivElement;
	// element: HTMLFormElement;
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		super("project-input","app",true,"user-input");
		// this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
		// this.hostElement = document.getElementById("app")! as HTMLDivElement;

		// const importedNode = document.importNode(this.templateElement.content, true);
		// this.element = importedNode.firstElementChild as HTMLFormElement;
		// this.element.id = "user-input";

		this.titleInputElement = this.element.querySelector("#title")! as HTMLInputElement;
		this.descriptionInputElement = this.element.querySelector(
			"#description"
		)! as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement;
		this.configure();
		// this.attach();
	}
	configure() {
		// this.element.addEventListener('submit',this.submitHandler.bind(this));
		this.element.addEventListener("submit", this.submitHandler);
	}
	renderContent(): void {
		
	}

	private gatherUserInput(): [string, string, number] | void {
		const enteredTitle = this.titleInputElement.value;
		const enteredDescription = this.descriptionInputElement.value;
		const enteredPeople = this.peopleInputElement.value;

		const titleValidatable: Validatable = {
			value: enteredTitle,
			required: true,
		};
		const descriptionValidatable: Validatable = {
			value: enteredDescription,
			required: true,
			minLength: 5,
		};
		const peopleValidatable: Validatable = {
			value: +enteredPeople,
			required: true,
			min: 1,
			max: 5,
		};

		if (
			!validate(titleValidatable) ||
			!validate(descriptionValidatable) ||
			!validate(peopleValidatable)
		) {
			alert("Invalid Input, please try again");
			return;
		} else {
			return [enteredTitle, enteredDescription, +enteredPeople];
		}
	}

	@autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		if (Array.isArray(userInput)) {
			const [title, desc, people] = userInput;
			projectState.addProject(title, desc, people);
			// this.clearInputs();
		}
	}
	// private attach() {
	// 	this.hostElement.insertAdjacentElement("afterbegin", this.element);
	// }
}
const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
