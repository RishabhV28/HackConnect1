import {
  Organization,
  InsertOrganization,
  Service,
  InsertService,
  Equipment,
  InsertEquipment,
  Connection,
  InsertConnection,
  ServiceRequest,
  InsertServiceRequest,
  EquipmentBorrowing,
  InsertEquipmentBorrowing,
  Message,
  InsertMessage,
  organizations,
  services,
  equipment,
  connections,
  serviceRequests,
  equipmentBorrowings,
  messages
} from "@shared/schema";
import { db } from "./db";
import { and, asc, count, desc, eq, or, sql } from "drizzle-orm";

export interface IStorage {
  // Organization methods
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByUsername(username: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getAllOrganizations(): Promise<Organization[]>;
  
  // Service methods
  createService(service: InsertService): Promise<Service>;
  getServiceById(id: number): Promise<Service | undefined>;
  getServicesByOrganizationId(organizationId: number): Promise<Service[]>;
  getAllServices(): Promise<Service[]>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Equipment methods
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  getEquipmentById(id: number): Promise<Equipment | undefined>;
  getEquipmentByOrganizationId(organizationId: number): Promise<Equipment[]>;
  getAllEquipment(): Promise<Equipment[]>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;
  
  // Connection methods
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnectionById(id: number): Promise<Connection | undefined>;
  getConnectionsByOrganizationId(organizationId: number): Promise<Connection[]>;
  updateConnectionStatus(id: number, status: string): Promise<Connection | undefined>;
  checkConnection(requesterId: number, receiverId: number): Promise<Connection | undefined>;
  
  // Service request methods
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequestById(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequestsByServiceId(serviceId: number): Promise<ServiceRequest[]>;
  getServiceRequestsByOrganizationId(organizationId: number): Promise<ServiceRequest[]>;
  updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined>;
  
  // Equipment borrowing methods
  createEquipmentBorrowing(borrowing: InsertEquipmentBorrowing): Promise<EquipmentBorrowing>;
  getEquipmentBorrowingById(id: number): Promise<EquipmentBorrowing | undefined>;
  getEquipmentBorrowingsByEquipmentId(equipmentId: number): Promise<EquipmentBorrowing[]>;
  getEquipmentBorrowingsByOrganizationId(organizationId: number): Promise<EquipmentBorrowing[]>;
  updateEquipmentBorrowingStatus(id: number, status: string): Promise<EquipmentBorrowing | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessageById(id: number): Promise<Message | undefined>;
  getConversation(organizationId1: number, organizationId2: number): Promise<Message[]>;
  getUnreadMessageCount(organizationId: number): Promise<number>;
  markMessageAsRead(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private organizations: Map<number, Organization>;
  private services: Map<number, Service>;
  private equipment: Map<number, Equipment>;
  private connections: Map<number, Connection>;
  private serviceRequests: Map<number, ServiceRequest>;
  private equipmentBorrowings: Map<number, EquipmentBorrowing>;
  private messages: Map<number, Message>;
  
  private organizationId: number;
  private serviceId: number;
  private equipmentId: number;
  private connectionId: number;
  private serviceRequestId: number;
  private equipmentBorrowingId: number;
  private messageId: number;
  
  constructor() {
    this.organizations = new Map();
    this.services = new Map();
    this.equipment = new Map();
    this.connections = new Map();
    this.serviceRequests = new Map();
    this.equipmentBorrowings = new Map();
    this.messages = new Map();
    
    this.organizationId = 1;
    this.serviceId = 1;
    this.equipmentId = 1;
    this.connectionId = 1;
    this.serviceRequestId = 1;
    this.equipmentBorrowingId = 1;
    this.messageId = 1;
    
    // Add some initial data for testing
    this.createInitialData();
  }
  
  private createInitialData() {
    // Create a few sample organizations
    const org1 = this.createOrganization({
      name: "Tech Society",
      username: "techsociety",
      password: "password123",
      description: "We are a society focused on technology and innovation.",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    const org2 = this.createOrganization({
      name: "Design Club",
      username: "designclub",
      password: "password123",
      description: "A creative club focused on design thinking and visual arts.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    // Create some services
    this.createService({
      title: "Web Development Workshop",
      description: "Our society offers a comprehensive workshop on modern web development practices, covering HTML, CSS, JavaScript, and responsive design.",
      isFree: true,
      serviceType: "Technical",
      availability: "Available on request",
      organizationId: org1.id
    });
    
    this.createService({
      title: "Digital Marketing Strategy",
      description: "Strategic marketing consultation for student societies looking to increase their digital presence and event attendance.",
      isFree: false,
      serviceType: "Marketing",
      availability: "Available on weekends",
      organizationId: org1.id
    });
    
    // Create some equipment
    this.createEquipment({
      name: "DSLR Camera",
      description: "Canon EOS 5D Mark IV with 24-70mm lens",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
      isAvailable: true,
      organizationId: org1.id
    });
    
    this.createEquipment({
      name: "Sound System",
      description: "Complete PA system with mixer, speakers, and microphones",
      image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e",
      isAvailable: true,
      organizationId: org1.id
    });
  }
  
  // Organization methods implementation
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }
  
  async getOrganizationByUsername(username: string): Promise<Organization | undefined> {
    return Array.from(this.organizations.values()).find(
      (org) => org.username === username
    );
  }
  
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const id = this.organizationId++;
    const now = new Date();
    const newOrganization: Organization = { ...organization, id, createdAt: now };
    this.organizations.set(id, newOrganization);
    return newOrganization;
  }
  
  async getAllOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }
  
  // Service methods implementation
  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceId++;
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }
  
  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServicesByOrganizationId(organizationId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.organizationId === organizationId
    );
  }
  
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) return undefined;
    
    const updatedService = { ...existingService, ...service };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
  
  // Equipment methods implementation
  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const id = this.equipmentId++;
    const newEquipment: Equipment = { ...equipment, id };
    this.equipment.set(id, newEquipment);
    return newEquipment;
  }
  
  async getEquipmentById(id: number): Promise<Equipment | undefined> {
    return this.equipment.get(id);
  }
  
  async getEquipmentByOrganizationId(organizationId: number): Promise<Equipment[]> {
    return Array.from(this.equipment.values()).filter(
      (equipment) => equipment.organizationId === organizationId
    );
  }
  
  async getAllEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }
  
  async updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const existingEquipment = this.equipment.get(id);
    if (!existingEquipment) return undefined;
    
    const updatedEquipment = { ...existingEquipment, ...equipment };
    this.equipment.set(id, updatedEquipment);
    return updatedEquipment;
  }
  
  async deleteEquipment(id: number): Promise<boolean> {
    return this.equipment.delete(id);
  }
  
  // Connection methods implementation
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.connectionId++;
    const now = new Date();
    const newConnection: Connection = { ...connection, id, createdAt: now };
    this.connections.set(id, newConnection);
    return newConnection;
  }
  
  async getConnectionById(id: number): Promise<Connection | undefined> {
    return this.connections.get(id);
  }
  
  async getConnectionsByOrganizationId(organizationId: number): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (connection) => 
        connection.requesterId === organizationId || 
        connection.receiverId === organizationId
    );
  }
  
  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const existingConnection = this.connections.get(id);
    if (!existingConnection) return undefined;
    
    const updatedConnection = { ...existingConnection, status };
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }
  
  async checkConnection(requesterId: number, receiverId: number): Promise<Connection | undefined> {
    return Array.from(this.connections.values()).find(
      (connection) => 
        (connection.requesterId === requesterId && connection.receiverId === receiverId) || 
        (connection.requesterId === receiverId && connection.receiverId === requesterId)
    );
  }
  
  // Service request methods implementation
  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const id = this.serviceRequestId++;
    const now = new Date();
    const newRequest: ServiceRequest = { ...request, id, createdAt: now };
    this.serviceRequests.set(id, newRequest);
    return newRequest;
  }
  
  async getServiceRequestById(id: number): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }
  
  async getServiceRequestsByServiceId(serviceId: number): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).filter(
      (request) => request.serviceId === serviceId
    );
  }
  
  async getServiceRequestsByOrganizationId(organizationId: number): Promise<ServiceRequest[]> {
    const services = await this.getServicesByOrganizationId(organizationId);
    const serviceIds = services.map(service => service.id);
    
    return Array.from(this.serviceRequests.values()).filter(
      (request) => 
        serviceIds.includes(request.serviceId) || 
        request.requesterId === organizationId
    );
  }
  
  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined> {
    const existingRequest = this.serviceRequests.get(id);
    if (!existingRequest) return undefined;
    
    const updatedRequest = { ...existingRequest, status };
    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Equipment borrowing methods implementation
  async createEquipmentBorrowing(borrowing: InsertEquipmentBorrowing): Promise<EquipmentBorrowing> {
    const id = this.equipmentBorrowingId++;
    const now = new Date();
    const newBorrowing: EquipmentBorrowing = { ...borrowing, id, createdAt: now };
    this.equipmentBorrowings.set(id, newBorrowing);
    return newBorrowing;
  }
  
  async getEquipmentBorrowingById(id: number): Promise<EquipmentBorrowing | undefined> {
    return this.equipmentBorrowings.get(id);
  }
  
  async getEquipmentBorrowingsByEquipmentId(equipmentId: number): Promise<EquipmentBorrowing[]> {
    return Array.from(this.equipmentBorrowings.values()).filter(
      (borrowing) => borrowing.equipmentId === equipmentId
    );
  }
  
  async getEquipmentBorrowingsByOrganizationId(organizationId: number): Promise<EquipmentBorrowing[]> {
    const equipment = await this.getEquipmentByOrganizationId(organizationId);
    const equipmentIds = equipment.map(eq => eq.id);
    
    return Array.from(this.equipmentBorrowings.values()).filter(
      (borrowing) => 
        equipmentIds.includes(borrowing.equipmentId) || 
        borrowing.borrowerId === organizationId
    );
  }
  
  async updateEquipmentBorrowingStatus(id: number, status: string): Promise<EquipmentBorrowing | undefined> {
    const existingBorrowing = this.equipmentBorrowings.get(id);
    if (!existingBorrowing) return undefined;
    
    const updatedBorrowing = { ...existingBorrowing, status };
    this.equipmentBorrowings.set(id, updatedBorrowing);
    return updatedBorrowing;
  }
  
  // Message methods implementation
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    const newMessage: Message = { ...message, id, read: false, createdAt: now };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async getMessageById(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getConversation(organizationId1: number, organizationId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => 
          (message.senderId === organizationId1 && message.receiverId === organizationId2) || 
          (message.senderId === organizationId2 && message.receiverId === organizationId1)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getUnreadMessageCount(organizationId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter((message) => message.receiverId === organizationId && !message.read)
      .length;
  }
  
  async markMessageAsRead(id: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    
    message.read = true;
    this.messages.set(id, message);
    return true;
  }
}

export class DatabaseStorage implements IStorage {
  // Organization methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    const result = await db.query.organizations.findFirst({
      where: eq(organizations.id, id)
    });
    return result || undefined;
  }

  async getOrganizationByUsername(username: string): Promise<Organization | undefined> {
    const result = await db.query.organizations.findFirst({
      where: eq(organizations.username, username)
    });
    return result || undefined;
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [result] = await db.insert(organizations)
      .values(organization)
      .returning();
    return result;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await db.query.organizations.findMany();
  }

  // Service methods
  async createService(service: InsertService): Promise<Service> {
    const [result] = await db.insert(services)
      .values(service)
      .returning();
    return result;
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const result = await db.query.services.findFirst({
      where: eq(services.id, id)
    });
    return result || undefined;
  }

  async getServicesByOrganizationId(organizationId: number): Promise<Service[]> {
    return await db.query.services.findMany({
      where: eq(services.organizationId, organizationId)
    });
  }

  async getAllServices(): Promise<Service[]> {
    return await db.query.services.findMany();
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [result] = await db.update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return result || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services)
      .where(eq(services.id, id))
      .returning();
    return result.length > 0;
  }

  // Equipment methods
  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [result] = await db.insert(equipment)
      .values(equipmentData)
      .returning();
    return result;
  }

  async getEquipmentById(id: number): Promise<Equipment | undefined> {
    const result = await db.query.equipment.findFirst({
      where: eq(equipment.id, id)
    });
    return result || undefined;
  }

  async getEquipmentByOrganizationId(organizationId: number): Promise<Equipment[]> {
    return await db.query.equipment.findMany({
      where: eq(equipment.organizationId, organizationId)
    });
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return await db.query.equipment.findMany();
  }

  async updateEquipment(id: number, equipmentData: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const [result] = await db.update(equipment)
      .set(equipmentData)
      .where(eq(equipment.id, id))
      .returning();
    return result || undefined;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    const result = await db.delete(equipment)
      .where(eq(equipment.id, id))
      .returning();
    return result.length > 0;
  }

  // Connection methods
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const [result] = await db.insert(connections)
      .values(connection)
      .returning();
    return result;
  }

  async getConnectionById(id: number): Promise<Connection | undefined> {
    const result = await db.query.connections.findFirst({
      where: eq(connections.id, id)
    });
    return result || undefined;
  }

  async getConnectionsByOrganizationId(organizationId: number): Promise<Connection[]> {
    return await db.query.connections.findMany({
      where: or(
        eq(connections.requesterId, organizationId),
        eq(connections.receiverId, organizationId)
      )
    });
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const [result] = await db.update(connections)
      .set({ status })
      .where(eq(connections.id, id))
      .returning();
    return result || undefined;
  }

  async checkConnection(requesterId: number, receiverId: number): Promise<Connection | undefined> {
    const result = await db.query.connections.findFirst({
      where: or(
        and(
          eq(connections.requesterId, requesterId),
          eq(connections.receiverId, receiverId)
        ),
        and(
          eq(connections.requesterId, receiverId),
          eq(connections.receiverId, requesterId)
        )
      )
    });
    return result || undefined;
  }

  // Service request methods
  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [result] = await db.insert(serviceRequests)
      .values(request)
      .returning();
    return result;
  }

  async getServiceRequestById(id: number): Promise<ServiceRequest | undefined> {
    const result = await db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.id, id)
    });
    return result || undefined;
  }

  async getServiceRequestsByServiceId(serviceId: number): Promise<ServiceRequest[]> {
    return await db.query.serviceRequests.findMany({
      where: eq(serviceRequests.serviceId, serviceId)
    });
  }

  async getServiceRequestsByOrganizationId(organizationId: number): Promise<ServiceRequest[]> {
    // Find all services owned by this organization
    const servicesResult = await db.query.services.findMany({
      where: eq(services.organizationId, organizationId),
      columns: { id: true }
    });
    const serviceIds = servicesResult.map(s => s.id);

    // Find requests for this organization's services or made by this organization
    return await db.query.serviceRequests.findMany({
      where: or(
        eq(serviceRequests.requesterId, organizationId),
        serviceIds.length > 0 ? 
          sql`${serviceRequests.serviceId} IN (${serviceIds.join(', ')})` : 
          sql`1 = 0`
      )
    });
  }

  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined> {
    const [result] = await db.update(serviceRequests)
      .set({ status })
      .where(eq(serviceRequests.id, id))
      .returning();
    return result || undefined;
  }

  // Equipment borrowing methods
  async createEquipmentBorrowing(borrowing: InsertEquipmentBorrowing): Promise<EquipmentBorrowing> {
    const [result] = await db.insert(equipmentBorrowings)
      .values(borrowing)
      .returning();
    return result;
  }

  async getEquipmentBorrowingById(id: number): Promise<EquipmentBorrowing | undefined> {
    const result = await db.query.equipmentBorrowings.findFirst({
      where: eq(equipmentBorrowings.id, id)
    });
    return result || undefined;
  }

  async getEquipmentBorrowingsByEquipmentId(equipmentId: number): Promise<EquipmentBorrowing[]> {
    return await db.query.equipmentBorrowings.findMany({
      where: eq(equipmentBorrowings.equipmentId, equipmentId)
    });
  }

  async getEquipmentBorrowingsByOrganizationId(organizationId: number): Promise<EquipmentBorrowing[]> {
    // Find all equipment owned by this organization
    const equipmentResult = await db.query.equipment.findMany({
      where: eq(equipment.organizationId, organizationId),
      columns: { id: true }
    });
    const equipmentIds = equipmentResult.map(e => e.id);

    // Find borrowings for this organization's equipment or made by this organization
    return await db.query.equipmentBorrowings.findMany({
      where: or(
        eq(equipmentBorrowings.borrowerId, organizationId),
        equipmentIds.length > 0 ? 
          sql`${equipmentBorrowings.equipmentId} IN (${equipmentIds.join(', ')})` : 
          sql`1 = 0`
      )
    });
  }

  async updateEquipmentBorrowingStatus(id: number, status: string): Promise<EquipmentBorrowing | undefined> {
    const [result] = await db.update(equipmentBorrowings)
      .set({ status })
      .where(eq(equipmentBorrowings.id, id))
      .returning();
    return result || undefined;
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages)
      .values({ ...message, read: false })
      .returning();
    return result;
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    const result = await db.query.messages.findFirst({
      where: eq(messages.id, id)
    });
    return result || undefined;
  }

  async getConversation(organizationId1: number, organizationId2: number): Promise<Message[]> {
    return await db.query.messages.findMany({
      where: or(
        and(
          eq(messages.senderId, organizationId1),
          eq(messages.receiverId, organizationId2)
        ),
        and(
          eq(messages.senderId, organizationId2),
          eq(messages.receiverId, organizationId1)
        )
      ),
      orderBy: asc(messages.createdAt)
    });
  }

  async getUnreadMessageCount(organizationId: number): Promise<number> {
    const result = await db.select({ count: count() })
      .from(messages)
      .where(and(
        eq(messages.receiverId, organizationId),
        eq(messages.read, false)
      ));
    return result[0]?.count || 0;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await db.update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    return result.length > 0;
  }
}

// Change from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
