import {
  organizations, Organization, InsertOrganization,
  services, Service, InsertService,
  equipment, Equipment, InsertEquipment,
  serviceRequests, ServiceRequest, InsertServiceRequest,
  equipmentRequests, EquipmentRequest, InsertEquipmentRequest,
  networkConnections, NetworkConnection, InsertNetworkConnection,
  messages, Message, InsertMessage
} from "@shared/schema";

export interface IStorage {
  // Organization methods
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByUsername(username: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, organization: Partial<Organization>): Promise<Organization | undefined>;
  
  // Service methods
  getService(id: number): Promise<Service | undefined>;
  getServicesByOrganization(organizationId: number): Promise<Service[]>;
  getAllServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Equipment methods
  getEquipment(id: number): Promise<Equipment | undefined>;
  getEquipmentByOrganization(organizationId: number): Promise<Equipment[]>;
  getAllEquipment(): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<Equipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;
  
  // Service Request methods
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequestsByService(serviceId: number): Promise<ServiceRequest[]>;
  getServiceRequestsByRequestor(requestorId: number): Promise<ServiceRequest[]>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: number, request: Partial<ServiceRequest>): Promise<ServiceRequest | undefined>;
  
  // Equipment Request methods
  getEquipmentRequest(id: number): Promise<EquipmentRequest | undefined>;
  getEquipmentRequestsByEquipment(equipmentId: number): Promise<EquipmentRequest[]>;
  getEquipmentRequestsByRequestor(requestorId: number): Promise<EquipmentRequest[]>;
  createEquipmentRequest(request: InsertEquipmentRequest): Promise<EquipmentRequest>;
  updateEquipmentRequest(id: number, request: Partial<EquipmentRequest>): Promise<EquipmentRequest | undefined>;
  
  // Network Connection methods
  getNetworkConnection(id: number): Promise<NetworkConnection | undefined>;
  getNetworkConnectionsByOrganization(organizationId: number): Promise<NetworkConnection[]>;
  getNetworkConnectionsForOrganization(organizationId: number): Promise<{ connection: NetworkConnection, organization: Organization }[]>;
  createNetworkConnection(connection: InsertNetworkConnection): Promise<NetworkConnection>;
  updateNetworkConnection(id: number, connection: Partial<NetworkConnection>): Promise<NetworkConnection | undefined>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessageConversation(senderId: number, receiverId: number): Promise<Message[]>;
  getUnreadMessageCount(receiverId: number): Promise<number>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private organizations: Map<number, Organization>;
  private services: Map<number, Service>;
  private equipment: Map<number, Equipment>;
  private serviceRequests: Map<number, ServiceRequest>;
  private equipmentRequests: Map<number, EquipmentRequest>;
  private networkConnections: Map<number, NetworkConnection>;
  private messages: Map<number, Message>;
  
  private currentOrganizationId: number;
  private currentServiceId: number;
  private currentEquipmentId: number;
  private currentServiceRequestId: number;
  private currentEquipmentRequestId: number;
  private currentNetworkConnectionId: number;
  private currentMessageId: number;

  constructor() {
    this.organizations = new Map();
    this.services = new Map();
    this.equipment = new Map();
    this.serviceRequests = new Map();
    this.equipmentRequests = new Map();
    this.networkConnections = new Map();
    this.messages = new Map();
    
    this.currentOrganizationId = 1;
    this.currentServiceId = 1;
    this.currentEquipmentId = 1;
    this.currentServiceRequestId = 1;
    this.currentEquipmentRequestId = 1;
    this.currentNetworkConnectionId = 1;
    this.currentMessageId = 1;
    
    // Initialize with some test data
    this.initializeTestData();
  }

  private initializeTestData() {
    // Create test organizations
    const org1: InsertOrganization = {
      name: "Computer Science Society",
      username: "cs_society",
      password: "password123",
      description: "A society for CS students",
      email: "cs@university.edu",
      avatar: "CS"
    };
    
    const org2: InsertOrganization = {
      name: "Film Society",
      username: "film_society",
      password: "password123",
      description: "A society for film enthusiasts",
      email: "film@university.edu",
      avatar: "FS"
    };
    
    const org3: InsertOrganization = {
      name: "Engineering Society",
      username: "eng_society",
      password: "password123",
      description: "A society for engineering students",
      email: "eng@university.edu",
      avatar: "ES"
    };

    const csOrg = this.createOrganization(org1);
    const filmOrg = this.createOrganization(org2);
    const engOrg = this.createOrganization(org3);
  }

  // Organization methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async getOrganizationByUsername(username: string): Promise<Organization | undefined> {
    return Array.from(this.organizations.values()).find(
      (org) => org.username === username
    );
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const id = this.currentOrganizationId++;
    const createdAt = new Date();
    const newOrganization: Organization = { ...organization, id, createdAt };
    this.organizations.set(id, newOrganization);
    return newOrganization;
  }

  async updateOrganization(id: number, organization: Partial<Organization>): Promise<Organization | undefined> {
    const existingOrganization = this.organizations.get(id);
    if (!existingOrganization) {
      return undefined;
    }
    
    const updatedOrganization: Organization = { ...existingOrganization, ...organization };
    this.organizations.set(id, updatedOrganization);
    return updatedOrganization;
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByOrganization(organizationId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.organizationId === organizationId
    );
  }

  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const createdAt = new Date();
    const newService: Service = { ...service, id, createdAt };
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) {
      return undefined;
    }
    
    const updatedService: Service = { ...existingService, ...service };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Equipment methods
  async getEquipment(id: number): Promise<Equipment | undefined> {
    return this.equipment.get(id);
  }

  async getEquipmentByOrganization(organizationId: number): Promise<Equipment[]> {
    return Array.from(this.equipment.values()).filter(
      (equipment) => equipment.organizationId === organizationId
    );
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }

  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const id = this.currentEquipmentId++;
    const createdAt = new Date();
    const newEquipment: Equipment = { ...equipment, id, createdAt };
    this.equipment.set(id, newEquipment);
    return newEquipment;
  }

  async updateEquipment(id: number, equipment: Partial<Equipment>): Promise<Equipment | undefined> {
    const existingEquipment = this.equipment.get(id);
    if (!existingEquipment) {
      return undefined;
    }
    
    const updatedEquipment: Equipment = { ...existingEquipment, ...equipment };
    this.equipment.set(id, updatedEquipment);
    return updatedEquipment;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    return this.equipment.delete(id);
  }

  // Service Request methods
  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }

  async getServiceRequestsByService(serviceId: number): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).filter(
      (request) => request.serviceId === serviceId
    );
  }

  async getServiceRequestsByRequestor(requestorId: number): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).filter(
      (request) => request.requestorId === requestorId
    );
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const id = this.currentServiceRequestId++;
    const createdAt = new Date();
    const dateRequested = new Date();
    const newRequest: ServiceRequest = { ...request, id, createdAt, dateRequested };
    this.serviceRequests.set(id, newRequest);
    return newRequest;
  }

  async updateServiceRequest(id: number, request: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    const existingRequest = this.serviceRequests.get(id);
    if (!existingRequest) {
      return undefined;
    }
    
    const updatedRequest: ServiceRequest = { ...existingRequest, ...request };
    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Equipment Request methods
  async getEquipmentRequest(id: number): Promise<EquipmentRequest | undefined> {
    return this.equipmentRequests.get(id);
  }

  async getEquipmentRequestsByEquipment(equipmentId: number): Promise<EquipmentRequest[]> {
    return Array.from(this.equipmentRequests.values()).filter(
      (request) => request.equipmentId === equipmentId
    );
  }

  async getEquipmentRequestsByRequestor(requestorId: number): Promise<EquipmentRequest[]> {
    return Array.from(this.equipmentRequests.values()).filter(
      (request) => request.requestorId === requestorId
    );
  }

  async createEquipmentRequest(request: InsertEquipmentRequest): Promise<EquipmentRequest> {
    const id = this.currentEquipmentRequestId++;
    const createdAt = new Date();
    const newRequest: EquipmentRequest = { ...request, id, createdAt };
    this.equipmentRequests.set(id, newRequest);
    return newRequest;
  }

  async updateEquipmentRequest(id: number, request: Partial<EquipmentRequest>): Promise<EquipmentRequest | undefined> {
    const existingRequest = this.equipmentRequests.get(id);
    if (!existingRequest) {
      return undefined;
    }
    
    const updatedRequest: EquipmentRequest = { ...existingRequest, ...request };
    this.equipmentRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Network Connection methods
  async getNetworkConnection(id: number): Promise<NetworkConnection | undefined> {
    return this.networkConnections.get(id);
  }

  async getNetworkConnectionsByOrganization(organizationId: number): Promise<NetworkConnection[]> {
    return Array.from(this.networkConnections.values()).filter(
      (connection) => connection.requestorId === organizationId || connection.targetId === organizationId
    );
  }

  async getNetworkConnectionsForOrganization(organizationId: number): Promise<{ connection: NetworkConnection, organization: Organization }[]> {
    const connections = await this.getNetworkConnectionsByOrganization(organizationId);
    return Promise.all(
      connections.map(async (connection) => {
        const otherOrgId = connection.requestorId === organizationId 
          ? connection.targetId 
          : connection.requestorId;
        const organization = await this.getOrganization(otherOrgId);
        if (!organization) {
          throw new Error(`Organization with ID ${otherOrgId} not found`);
        }
        return { connection, organization };
      })
    );
  }

  async createNetworkConnection(connection: InsertNetworkConnection): Promise<NetworkConnection> {
    // Check if connection already exists
    const existingConnection = Array.from(this.networkConnections.values()).find(
      (conn) => 
        (conn.requestorId === connection.requestorId && conn.targetId === connection.targetId) ||
        (conn.requestorId === connection.targetId && conn.targetId === connection.requestorId)
    );
    
    if (existingConnection) {
      return existingConnection;
    }
    
    const id = this.currentNetworkConnectionId++;
    const createdAt = new Date();
    const newConnection: NetworkConnection = { ...connection, id, createdAt };
    this.networkConnections.set(id, newConnection);
    return newConnection;
  }

  async updateNetworkConnection(id: number, connection: Partial<NetworkConnection>): Promise<NetworkConnection | undefined> {
    const existingConnection = this.networkConnections.get(id);
    if (!existingConnection) {
      return undefined;
    }
    
    const updatedConnection: NetworkConnection = { ...existingConnection, ...connection };
    this.networkConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessageConversation(senderId: number, receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => 
          (message.senderId === senderId && message.receiverId === receiverId) ||
          (message.senderId === receiverId && message.receiverId === senderId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUnreadMessageCount(receiverId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter(message => message.receiverId === receiverId && !message.read)
      .length;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const createdAt = new Date();
    const newMessage: Message = { ...message, id, createdAt, read: false };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const existingMessage = this.messages.get(id);
    if (!existingMessage) {
      return undefined;
    }
    
    const updatedMessage: Message = { ...existingMessage, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
