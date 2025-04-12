import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertOrganizationSchema, 
  insertServiceSchema, 
  insertEquipmentSchema, 
  insertServiceRequestSchema, 
  insertEquipmentRequestSchema, 
  insertNetworkConnectionSchema, 
  insertMessageSchema,
  loginSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "hackconnect-session-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const organization = await storage.getOrganizationByUsername(username);
        if (!organization) {
          return done(null, false, { message: "Invalid username" });
        }
        if (organization.password !== password) {
          return done(null, false, { message: "Invalid password" });
        }
        return done(null, organization);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((org, done) => {
    done(null, (org as any).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const organization = await storage.getOrganization(id);
      done(null, organization);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const parsedBody = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: Error, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
          });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const organizationData = insertOrganizationSchema.parse(req.body);
      
      // Check if username already exists
      const existingOrg = await storage.getOrganizationByUsername(organizationData.username);
      if (existingOrg) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const newOrganization = await storage.createOrganization(organizationData);
      res.status(201).json({
        id: newOrganization.id,
        name: newOrganization.name,
        username: newOrganization.username,
        email: newOrganization.email,
        avatar: newOrganization.avatar,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid organization data" });
    }
  });

  // Organization routes
  app.get("/api/organizations", async (req, res) => {
    const organizations = Array.from((await Promise.all(
      Array.from({ length: storage.currentOrganizationId - 1 }, (_, i) => i + 1)
        .map(id => storage.getOrganization(id))
    )).filter(Boolean) as any[]);
    
    res.json(organizations.map(org => ({
      id: org.id,
      name: org.name,
      username: org.username,
      description: org.description,
      email: org.email,
      avatar: org.avatar,
    })));
  });

  app.get("/api/organizations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const organization = await storage.getOrganization(id);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    res.json({
      id: organization.id,
      name: organization.name,
      username: organization.username,
      description: organization.description,
      email: organization.email,
      avatar: organization.avatar,
    });
  });

  // Service routes
  app.get("/api/services", async (req, res) => {
    const services = await storage.getAllServices();
    res.json(services);
  });

  app.get("/api/services/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const service = await storage.getService(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    res.json(service);
  });

  app.get("/api/organizations/:id/services", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const services = await storage.getServicesByOrganization(id);
    res.json(services);
  });

  app.post("/api/services", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const serviceData = insertServiceSchema.parse({
        ...req.body,
        organizationId: user.id,
      });
      
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid service data" });
    }
  });

  app.put("/api/services/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    try {
      const user = req.user as any;
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      if (service.organizationId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedService = await storage.updateService(id, req.body);
      res.json(updatedService);
    } catch (error) {
      res.status(400).json({ message: "Invalid service data" });
    }
  });

  app.delete("/api/services/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const user = req.user as any;
    const service = await storage.getService(id);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    if (service.organizationId !== user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const deleted = await storage.deleteService(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Equipment routes
  app.get("/api/equipment", async (req, res) => {
    const equipment = await storage.getAllEquipment();
    res.json(equipment);
  });

  app.get("/api/equipment/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const equipment = await storage.getEquipment(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    
    res.json(equipment);
  });

  app.get("/api/organizations/:id/equipment", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const equipment = await storage.getEquipmentByOrganization(id);
    res.json(equipment);
  });

  app.post("/api/equipment", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const equipmentData = insertEquipmentSchema.parse({
        ...req.body,
        organizationId: user.id,
      });
      
      const equipment = await storage.createEquipment(equipmentData);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(400).json({ message: "Invalid equipment data" });
    }
  });

  app.put("/api/equipment/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    try {
      const user = req.user as any;
      const equipment = await storage.getEquipment(id);
      
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      if (equipment.organizationId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedEquipment = await storage.updateEquipment(id, req.body);
      res.json(updatedEquipment);
    } catch (error) {
      res.status(400).json({ message: "Invalid equipment data" });
    }
  });

  app.delete("/api/equipment/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const user = req.user as any;
    const equipment = await storage.getEquipment(id);
    
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    
    if (equipment.organizationId !== user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const deleted = await storage.deleteEquipment(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(500).json({ message: "Failed to delete equipment" });
    }
  });

  // Service Request routes
  app.get("/api/services/:id/requests", isAuthenticated, async (req, res) => {
    const serviceId = parseInt(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    
    const user = req.user as any;
    const service = await storage.getService(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    if (service.organizationId !== user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const requests = await storage.getServiceRequestsByService(serviceId);
    res.json(requests);
  });

  app.post("/api/services/:id/requests", isAuthenticated, async (req, res) => {
    const serviceId = parseInt(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    
    try {
      const user = req.user as any;
      const service = await storage.getService(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      if (service.organizationId === user.id) {
        return res.status(400).json({ message: "Cannot request your own service" });
      }
      
      const requestData = insertServiceRequestSchema.parse({
        ...req.body,
        serviceId,
        requestorId: user.id,
      });
      
      const request = await storage.createServiceRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/service-requests/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    try {
      const user = req.user as any;
      const request = await storage.getServiceRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const service = await storage.getService(request.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      if (service.organizationId !== user.id && request.requestorId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedRequest = await storage.updateServiceRequest(id, req.body);
      res.json(updatedRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Equipment Request routes
  app.get("/api/equipment/:id/requests", isAuthenticated, async (req, res) => {
    const equipmentId = parseInt(req.params.id);
    if (isNaN(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }
    
    const user = req.user as any;
    const equipment = await storage.getEquipment(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    
    if (equipment.organizationId !== user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const requests = await storage.getEquipmentRequestsByEquipment(equipmentId);
    res.json(requests);
  });

  app.post("/api/equipment/:id/requests", isAuthenticated, async (req, res) => {
    const equipmentId = parseInt(req.params.id);
    if (isNaN(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }
    
    try {
      const user = req.user as any;
      const equipment = await storage.getEquipment(equipmentId);
      
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      if (equipment.organizationId === user.id) {
        return res.status(400).json({ message: "Cannot request your own equipment" });
      }
      
      const requestData = insertEquipmentRequestSchema.parse({
        ...req.body,
        equipmentId,
        requestorId: user.id,
      });
      
      const request = await storage.createEquipmentRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/equipment-requests/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    try {
      const user = req.user as any;
      const request = await storage.getEquipmentRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const equipment = await storage.getEquipment(request.equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      
      if (equipment.organizationId !== user.id && request.requestorId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedRequest = await storage.updateEquipmentRequest(id, req.body);
      res.json(updatedRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Network Connection routes
  app.get("/api/network-connections", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const connections = await storage.getNetworkConnectionsForOrganization(user.id);
    
    res.json(connections);
  });

  app.post("/api/network-connections", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const connectionData = insertNetworkConnectionSchema.parse({
        ...req.body,
        requestorId: user.id,
      });
      
      if (connectionData.targetId === user.id) {
        return res.status(400).json({ message: "Cannot connect with yourself" });
      }
      
      const connection = await storage.createNetworkConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      res.status(400).json({ message: "Invalid connection data" });
    }
  });

  app.put("/api/network-connections/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    try {
      const user = req.user as any;
      const connection = await storage.getNetworkConnection(id);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      if (connection.requestorId !== user.id && connection.targetId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedConnection = await storage.updateNetworkConnection(id, req.body);
      res.json(updatedConnection);
    } catch (error) {
      res.status(400).json({ message: "Invalid connection data" });
    }
  });

  // Message routes
  app.get("/api/messages/:receiverId", isAuthenticated, async (req, res) => {
    const receiverId = parseInt(req.params.receiverId);
    if (isNaN(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }
    
    const user = req.user as any;
    const messages = await storage.getMessageConversation(user.id, receiverId);
    
    res.json(messages);
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: user.id,
      });
      
      if (messageData.receiverId === user.id) {
        return res.status(400).json({ message: "Cannot send message to yourself" });
      }
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.put("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const user = req.user as any;
    const message = await storage.getMessage(id);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    if (message.receiverId !== user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const updatedMessage = await storage.markMessageAsRead(id);
    res.json(updatedMessage);
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    const services = await storage.getServicesByOrganization(user.id);
    const activeServices = services.filter(service => service.status === "active").length;
    
    const equipmentItems = await storage.getEquipmentByOrganization(user.id);
    const equipmentCount = equipmentItems.length;
    
    const connections = await storage.getNetworkConnectionsByOrganization(user.id);
    const networkConnections = connections.filter(connection => connection.status === "connected").length;
    
    const unreadMessages = await storage.getUnreadMessageCount(user.id);
    
    res.json({
      activeServices,
      equipmentCount,
      networkConnections,
      unreadMessages
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
