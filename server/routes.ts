import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertOrganizationSchema, 
  insertServiceSchema, 
  insertEquipmentSchema,
  insertConnectionSchema,
  insertServiceRequestSchema,
  insertEquipmentBorrowingSchema,
  insertMessageSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session
  app.use(
    session({
      secret: "hackconnect-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Set up passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const organization = await storage.getOrganizationByUsername(username);
        if (!organization) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (organization.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, organization);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const organization = await storage.getOrganization(id);
      done(null, organization);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Authentication routes
  app.post('/api/login', (req, res, next) => {
    // Validate request
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid login data", errors: result.error.errors });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Login failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ message: "Login successful", user });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/me', isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  // Organization routes
  app.post('/api/organizations', async (req, res) => {
    try {
      const result = insertOrganizationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid organization data",
          errors: result.error.errors
        });
      }

      const existingOrg = await storage.getOrganizationByUsername(result.data.username);
      if (existingOrg) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const organization = await storage.createOrganization(result.data);
      res.status(201).json(organization);
    } catch (error) {
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  app.get('/api/organizations', async (req, res) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.get('/api/organizations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const organization = await storage.getOrganization(id);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  // Service routes
  app.post('/api/services', isAuthenticated, async (req, res) => {
    try {
      const result = insertServiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid service data",
          errors: result.error.errors
        });
      }

      const user = req.user as any;
      const service = await storage.createService({
        ...result.data,
        organizationId: user.id
      });
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getServiceById(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.get('/api/organizations/:id/services', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const services = await storage.getServicesByOrganizationId(id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.put('/api/services/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getServiceById(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const user = req.user as any;
      if (service.organizationId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this service" });
      }

      const result = insertServiceSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid service data",
          errors: result.error.errors
        });
      }

      const updatedService = await storage.updateService(id, result.data);
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete('/api/services/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getServiceById(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const user = req.user as any;
      if (service.organizationId !== user.id) {
        return res.status(403).json({ message: "Not authorized to delete this service" });
      }

      await storage.deleteService(id);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Equipment routes
  app.post('/api/equipment', isAuthenticated, async (req, res) => {
    try {
      const result = insertEquipmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid equipment data",
          errors: result.error.errors
        });
      }

      const user = req.user as any;
      const equipment = await storage.createEquipment({
        ...result.data,
        organizationId: user.id
      });
      res.status(201).json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });

  app.get('/api/equipment', async (req, res) => {
    try {
      const equipment = await storage.getAllEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get('/api/equipment/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipment = await storage.getEquipmentById(id);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get('/api/organizations/:id/equipment', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipment = await storage.getEquipmentByOrganizationId(id);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.put('/api/equipment/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipment = await storage.getEquipmentById(id);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      const user = req.user as any;
      if (equipment.organizationId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this equipment" });
      }

      const result = insertEquipmentSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid equipment data",
          errors: result.error.errors
        });
      }

      const updatedEquipment = await storage.updateEquipment(id, result.data);
      res.json(updatedEquipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update equipment" });
    }
  });

  app.delete('/api/equipment/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipment = await storage.getEquipmentById(id);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      const user = req.user as any;
      if (equipment.organizationId !== user.id) {
        return res.status(403).json({ message: "Not authorized to delete this equipment" });
      }

      await storage.deleteEquipment(id);
      res.json({ message: "Equipment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete equipment" });
    }
  });

  // Connection routes
  app.post('/api/connections', isAuthenticated, async (req, res) => {
    try {
      const result = insertConnectionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid connection data",
          errors: result.error.errors
        });
      }

      const user = req.user as any;
      if (result.data.requesterId !== user.id) {
        return res.status(403).json({ message: "Not authorized to create connection for other organization" });
      }

      // Check if connection already exists
      const existingConnection = await storage.checkConnection(result.data.requesterId, result.data.receiverId);
      if (existingConnection) {
        return res.status(400).json({ message: "Connection already exists" });
      }

      const connection = await storage.createConnection(result.data);
      res.status(201).json(connection);
    } catch (error) {
      res.status(500).json({ message: "Failed to create connection" });
    }
  });

  app.get('/api/connections', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const connections = await storage.getConnectionsByOrganizationId(user.id);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.put('/api/connections/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const connection = await storage.getConnectionById(id);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }

      const user = req.user as any;
      if (connection.receiverId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this connection" });
      }

      const updatedConnection = await storage.updateConnectionStatus(id, status);
      res.json(updatedConnection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update connection status" });
    }
  });

  // Service request routes
  app.post('/api/service-requests', isAuthenticated, async (req, res) => {
    try {
      const result = insertServiceRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid service request data",
          errors: result.error.errors
        });
      }

      const user = req.user as any;
      if (result.data.requesterId !== user.id) {
        return res.status(403).json({ message: "Not authorized to create service request for other organization" });
      }

      const service = await storage.getServiceById(result.data.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const request = await storage.createServiceRequest(result.data);
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  app.get('/api/service-requests', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const requests = await storage.getServiceRequestsByOrganizationId(user.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.get('/api/services/:id/requests', isAuthenticated, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const service = await storage.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const user = req.user as any;
      if (service.organizationId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view requests for this service" });
      }

      const requests = await storage.getServiceRequestsByServiceId(serviceId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.put('/api/service-requests/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const request = await storage.getServiceRequestById(id);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }

      const service = await storage.getServiceById(request.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const user = req.user as any;
      if (service.organizationId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this service request" });
      }

      const updatedRequest = await storage.updateServiceRequestStatus(id, status);
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service request status" });
    }
  });

  // Equipment borrowing routes
  app.post('/api/equipment-borrowings', isAuthenticated, async (req, res) => {
    try {
      const result = insertEquipmentBorrowingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid equipment borrowing data",
          errors: result.error.errors
        });
      }

      const user = req.user as any;
      if (result.data.borrowerId !== user.id) {
        return res.status(403).json({ message: "Not authorized to create borrowing request for other organization" });
      }

      const equipment = await storage.getEquipmentById(result.data.equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      if (!equipment.isAvailable) {
        return res.status(400).json({ message: "Equipment is not available" });
      }

      const borrowing = await storage.createEquipmentBorrowing(result.data);
      res.status(201).json(borrowing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create equipment borrowing" });
    }
  });

  app.get('/api/equipment-borrowings', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const borrowings = await storage.getEquipmentBorrowingsByOrganizationId(user.id);
      res.json(borrowings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment borrowings" });
    }
  });

  app.get('/api/equipment/:id/borrowings', isAuthenticated, async (req, res) => {
    try {
      const equipmentId = parseInt(req.params.id);
      const equipment = await storage.getEquipmentById(equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      const user = req.user as any;
      if (equipment.organizationId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view borrowings for this equipment" });
      }

      const borrowings = await storage.getEquipmentBorrowingsByEquipmentId(equipmentId);
      res.json(borrowings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment borrowings" });
    }
  });

  app.put('/api/equipment-borrowings/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['approved', 'rejected', 'returned'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const borrowing = await storage.getEquipmentBorrowingById(id);
      if (!borrowing) {
        return res.status(404).json({ message: "Equipment borrowing not found" });
      }

      const equipment = await storage.getEquipmentById(borrowing.equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      const user = req.user as any;
      if (equipment.organizationId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this equipment borrowing" });
      }

      // Update equipment availability
      if (status === 'approved') {
        await storage.updateEquipment(equipment.id, { isAvailable: false });
      } else if (status === 'returned') {
        await storage.updateEquipment(equipment.id, { isAvailable: true });
      }

      const updatedBorrowing = await storage.updateEquipmentBorrowingStatus(id, status);
      res.json(updatedBorrowing);
    } catch (error) {
      res.status(500).json({ message: "Failed to update equipment borrowing status" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req, res) => {
    try {
      const result = insertMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid message data",
          errors: result.error.errors
        });
      }

      const user = req.user as any;
      if (result.data.senderId !== user.id) {
        return res.status(403).json({ message: "Not authorized to send message as other organization" });
      }

      const receiver = await storage.getOrganization(result.data.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver organization not found" });
      }

      const message = await storage.createMessage(result.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/messages/:organizationId', isAuthenticated, async (req, res) => {
    try {
      const otherOrgId = parseInt(req.params.organizationId);
      const user = req.user as any;
      
      const conversation = await storage.getConversation(user.id, otherOrgId);
      
      // Mark all messages as read
      await Promise.all(
        conversation
          .filter(msg => msg.receiverId === user.id && !msg.read)
          .map(msg => storage.markMessageAsRead(msg.id))
      );
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get('/api/unread-messages', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const count = await storage.getUnreadMessageCount(user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
