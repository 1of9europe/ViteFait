/// <reference types="jest" />

import { MissionService } from '../../../src/services/MissionService';
import { Mission } from '../../../src/models/Mission';
import { AppDataSource } from '../../../src/config/database';
import { MissionPriority } from '../../../src/types/enums';

// Mock des dépendances
jest.mock('../../../src/config/database');

describe('MissionService', () => {
  let missionService: MissionService;
  let mockMissionRepository: any;

  beforeEach(() => {
    // Créer un mock du repository
    mockMissionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    // Configurer le mock d'AppDataSource
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockMissionRepository);

    // Créer une instance du service
    missionService = new MissionService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMission', () => {
    it('should create a mission without initial meeting', async () => {
      // Arrange
      const missionData = {
        title: 'Test Mission',
        description: 'Test Description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000),
        priceEstimate: 50,
        requiresInitialMeeting: false,
        clientId: 'test-client-id'
      };

      const mockMission = new Mission();
      Object.assign(mockMission, { ...missionData, id: 'test-mission-id' });
      
      mockMissionRepository.create.mockReturnValue(mockMission);
      mockMissionRepository.save.mockResolvedValue(mockMission);

      // Act
      const result = await missionService.createMission(missionData);

      // Assert
      expect(mockMissionRepository.create).toHaveBeenCalledWith({
        ...missionData,
        meetingTimeSlot: null,
        priority: MissionPriority.MEDIUM,
        cashAdvance: 0,
        requiresCar: false,
        requiresTools: false
      });
      expect(mockMissionRepository.save).toHaveBeenCalledWith(mockMission);
      expect(result).toEqual(mockMission);
      expect(result.requiresInitialMeeting).toBe(false);
      expect(result.meetingTimeSlot).toBeNull();
    });

    it('should create a mission with initial meeting', async () => {
      // Arrange
      const meetingTimeSlot = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 heures dans le futur
      const missionData = {
        title: 'Test Mission with Meeting',
        description: 'Test Description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000),
        priceEstimate: 50,
        requiresInitialMeeting: true,
        meetingTimeSlot: meetingTimeSlot.toISOString(),
        clientId: 'test-client-id'
      };

      const mockMission = new Mission();
      Object.assign(mockMission, { 
        ...missionData, 
        id: 'test-mission-id',
        meetingTimeSlot: meetingTimeSlot
      });
      
      mockMissionRepository.create.mockReturnValue(mockMission);
      mockMissionRepository.save.mockResolvedValue(mockMission);

      // Act
      const result = await missionService.createMission(missionData);

      // Assert
      expect(mockMissionRepository.create).toHaveBeenCalledWith({
        ...missionData,
        meetingTimeSlot: meetingTimeSlot,
        priority: MissionPriority.MEDIUM,
        cashAdvance: 0,
        requiresCar: false,
        requiresTools: false
      });
      expect(mockMissionRepository.save).toHaveBeenCalledWith(mockMission);
      expect(result).toEqual(mockMission);
      expect(result.requiresInitialMeeting).toBe(true);
      expect(result.meetingTimeSlot).toEqual(meetingTimeSlot);
    });

    it('should handle invalid meeting time slot when requiresInitialMeeting is true', async () => {
      // Arrange
      const missionData = {
        title: 'Test Mission',
        description: 'Test Description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000),
        priceEstimate: 50,
        requiresInitialMeeting: true,
        meetingTimeSlot: 'invalid-date',
        clientId: 'test-client-id'
      };

      mockMissionRepository.create.mockImplementation(() => {
        throw new Error('Invalid date format');
      });

      // Act & Assert
      await expect(missionService.createMission(missionData)).rejects.toThrow('Invalid date format');
    });

    it('should set meetingTimeSlot to null when requiresInitialMeeting is false even if meetingTimeSlot is provided', async () => {
      // Arrange
      const missionData = {
        title: 'Test Mission',
        description: 'Test Description',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        pickupAddress: '123 Test Street, Paris',
        timeWindowStart: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeWindowEnd: new Date(Date.now() + 25 * 60 * 60 * 1000),
        priceEstimate: 50,
        requiresInitialMeeting: false,
        meetingTimeSlot: new Date().toISOString(), // Fourni mais ignoré
        clientId: 'test-client-id'
      };

      const mockMission = new Mission();
      Object.assign(mockMission, { 
        ...missionData, 
        id: 'test-mission-id',
        meetingTimeSlot: null // Le service doit mettre cela à null
      });
      
      mockMissionRepository.create.mockReturnValue(mockMission);
      mockMissionRepository.save.mockResolvedValue(mockMission);

      // Act
      const result = await missionService.createMission(missionData);

      // Assert
      expect(mockMissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...missionData,
          meetingTimeSlot: null // Doit être null même si fourni
        })
      );
      expect(result.requiresInitialMeeting).toBe(false);
      expect(result.meetingTimeSlot).toBeNull();
    });
  });

  describe('getMissionsWithInitialMeetings', () => {
    it('should return missions that require initial meetings', async () => {
      // Arrange
      const mockMissions = [
        {
          id: 'mission-1',
          title: 'Mission with Meeting',
          requiresInitialMeeting: true,
          meetingTimeSlot: new Date(Date.now() + 2 * 60 * 60 * 1000)
        },
        {
          id: 'mission-2',
          title: 'Mission without Meeting',
          requiresInitialMeeting: false,
          meetingTimeSlot: null
        }
      ];

      mockMissionRepository.find.mockResolvedValue(mockMissions);

      // Act
      const result = await missionService.getMissionsWithInitialMeetings();

      // Assert
      expect(mockMissionRepository.find).toHaveBeenCalledWith({
        where: { requiresInitialMeeting: true },
        order: { meetingTimeSlot: 'ASC' }
      });
      expect(result).toEqual(mockMissions);
    });
  });

  describe('getMissionsByMeetingTimeSlot', () => {
    it('should return missions for a specific meeting time slot', async () => {
      // Arrange
      const targetDate = new Date('2024-12-25T10:00:00.000Z');
      const mockMissions = [
        {
          id: 'mission-1',
          title: 'Mission at 10:00',
          requiresInitialMeeting: true,
          meetingTimeSlot: targetDate
        }
      ];

      mockMissionRepository.find.mockResolvedValue(mockMissions);

      // Act
      const result = await missionService.getMissionsByMeetingTimeSlot(targetDate);

      // Assert
      expect(mockMissionRepository.find).toHaveBeenCalledWith({
        where: { 
          requiresInitialMeeting: true,
          meetingTimeSlot: targetDate
        }
      });
      expect(result).toEqual(mockMissions);
    });
  });
}); 