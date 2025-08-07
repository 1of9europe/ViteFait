/// <reference types="jest" />

import { BaseRepository } from '../../../src/services/BaseRepository';
import { AppDataSource } from '../../../src/config/database';
import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { NotFoundError, DatabaseError } from '../../../src/utils/errors';

// Mock des dépendances
jest.mock('../../../src/config/database');

// Classe de test pour BaseRepository
class TestEntity {
  id: string = '';
  name: string = '';
  email: string = '';

  constructor(data?: Partial<TestEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor() {
    super(TestEntity);
  }
}

describe('BaseRepository', () => {
  let testRepository: TestRepository;
  let mockRepository: jest.Mocked<Repository<TestEntity>>;

  beforeEach(() => {
    // Créer un mock du repository TypeORM
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn()
    } as any;

    // Configurer le mock d'AppDataSource
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    // Créer une instance du repository de test
    testRepository = new TestRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find entity by id successfully', async () => {
      // Arrange
      const mockEntity = new TestEntity({ id: 'test-id', name: 'Test', email: 'test@example.com' });
      mockRepository.findOne.mockResolvedValue(mockEntity);

      // Act
      const result = await testRepository.findById('test-id');

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      });
      expect(result).toEqual(mockEntity);
    });

    it('should return null when entity not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await testRepository.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockRepository.findOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.findById('test-id')).rejects.toThrow(DatabaseError);
    });
  });

  describe('findAll', () => {
    it('should find all entities without options', async () => {
      // Arrange
      const mockEntities = [
        new TestEntity({ id: '1', name: 'Test1', email: 'test1@example.com' }),
        new TestEntity({ id: '2', name: 'Test2', email: 'test2@example.com' })
      ];
      mockRepository.find.mockResolvedValue(mockEntities);

      // Act
      const result = await testRepository.findAll();

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockEntities);
    });

    it('should find all entities with options', async () => {
      // Arrange
      const options: FindManyOptions<TestEntity> = {
        where: { name: 'Test' },
        order: { name: 'ASC' }
      };
      const mockEntities = [
        new TestEntity({ id: '1', name: 'Test', email: 'test@example.com' })
      ];
      mockRepository.find.mockResolvedValue(mockEntities);

      // Act
      const result = await testRepository.findAll(options);

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockEntities);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockRepository.find.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.findAll()).rejects.toThrow(DatabaseError);
    });
  });

  describe('findOne', () => {
    it('should find one entity with options', async () => {
      // Arrange
      const options: FindOneOptions<TestEntity> = {
        where: { email: 'test@example.com' }
      };
      const mockEntity = new TestEntity({ id: 'test-id', name: 'Test', email: 'test@example.com' });
      mockRepository.findOne.mockResolvedValue(mockEntity);

      // Act
      const result = await testRepository.findOne(options);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockEntity);
    });

    it('should return null when entity not found', async () => {
      // Arrange
      const options: FindOneOptions<TestEntity> = {
        where: { email: 'nonexistent@example.com' }
      };
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await testRepository.findOne(options);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const options: FindOneOptions<TestEntity> = {
        where: { email: 'test@example.com' }
      };
      const dbError = new Error('Database connection failed');
      mockRepository.findOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.findOne(options)).rejects.toThrow(DatabaseError);
    });
  });

  describe('save', () => {
    it('should save entity successfully', async () => {
      // Arrange
      const entity = new TestEntity({ id: 'test-id', name: 'Test', email: 'test@example.com' });
      const savedEntity = new TestEntity({ id: 'test-id', name: 'Test', email: 'test@example.com' });
      mockRepository.save.mockResolvedValue(savedEntity);

      // Act
      const result = await testRepository.save(entity);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(savedEntity);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const entity = new TestEntity({ id: 'test-id', name: 'Test', email: 'test@example.com' });
      const dbError = new Error('Database connection failed');
      mockRepository.save.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.save(entity)).rejects.toThrow(DatabaseError);
    });
  });

  describe('create', () => {
    it('should create entity successfully', async () => {
      // Arrange
      const data: DeepPartial<TestEntity> = { name: 'Test', email: 'test@example.com' };
      const createdEntity = new TestEntity({ id: 'test-id', name: 'Test', email: 'test@example.com' });
      const savedEntity = new TestEntity({ id: 'test-id', name: 'Test', email: 'test@example.com' });
      
      mockRepository.create.mockReturnValue(createdEntity);
      mockRepository.save.mockResolvedValue(savedEntity);

      // Act
      const result = await testRepository.create(data);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(savedEntity);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const data: DeepPartial<TestEntity> = { name: 'Test', email: 'test@example.com' };
      const dbError = new Error('Database connection failed');
      mockRepository.create.mockImplementation(() => {
        throw dbError;
      });

      // Act & Assert
      await expect(testRepository.create(data)).rejects.toThrow(DatabaseError);
    });
  });

  describe('update', () => {
    it('should update entity successfully', async () => {
      // Arrange
      const id = 'test-id';
      const data: DeepPartial<TestEntity> = { name: 'Updated Test' };
      const updatedEntity = new TestEntity({ id: 'test-id', name: 'Updated Test', email: 'test@example.com' });
      
      mockRepository.findOne.mockResolvedValue(updatedEntity);
      mockRepository.save.mockResolvedValue(updatedEntity);

      // Act
      const result = await testRepository.update(id, data);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id } as unknown as FindOptionsWhere<TestEntity>
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedEntity);
      expect(result).toEqual(updatedEntity);
    });

    it('should throw NotFoundError when entity not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      const data: DeepPartial<TestEntity> = { name: 'Updated Test' };
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(testRepository.update(id, data)).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const id = 'test-id';
      const data: DeepPartial<TestEntity> = { name: 'Updated Test' };
      const dbError = new Error('Database connection failed');
      mockRepository.findOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.update(id, data)).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete', () => {
    it('should delete entity successfully', async () => {
      // Arrange
      const id = 'test-id';
      const mockEntity = new TestEntity({ id: 'test-id', name: 'Test', email: 'test@example.com' });
      mockRepository.findOne.mockResolvedValue(mockEntity);
      mockRepository.remove = jest.fn().mockResolvedValue(mockEntity);

      // Act
      await testRepository.delete(id);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id } as unknown as FindOptionsWhere<TestEntity>
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockEntity);
    });

    it('should throw NotFoundError when entity not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(testRepository.delete(id)).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const id = 'test-id';
      const dbError = new Error('Database connection failed');
      mockRepository.findOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.delete(id)).rejects.toThrow(DatabaseError);
    });
  });

  describe('count', () => {
    it('should count entities without options', async () => {
      // Arrange
      const expectedCount = 5;
      mockRepository.count.mockResolvedValue(expectedCount);

      // Act
      const result = await testRepository.count();

      // Assert
      expect(mockRepository.count).toHaveBeenCalledWith(undefined);
      expect(result).toBe(expectedCount);
    });

    it('should count entities with options', async () => {
      // Arrange
      const options: FindManyOptions<TestEntity> = {
        where: { name: 'Test' }
      };
      const expectedCount = 2;
      mockRepository.count.mockResolvedValue(expectedCount);

      // Act
      const result = await testRepository.count(options);

      // Assert
      expect(mockRepository.count).toHaveBeenCalledWith(options);
      expect(result).toBe(expectedCount);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockRepository.count.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.count()).rejects.toThrow(DatabaseError);
    });
  });

  describe('exists', () => {
    it('should return true when entity exists', async () => {
      // Arrange
      const id = 'test-id';
      mockRepository.count.mockResolvedValue(1);

      // Act
      const result = await testRepository.exists(id);

      // Assert
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { id } as unknown as FindOptionsWhere<TestEntity>
      });
      expect(result).toBe(true);
    });

    it('should return false when entity does not exist', async () => {
      // Arrange
      const id = 'non-existent-id';
      mockRepository.count.mockResolvedValue(0);

      // Act
      const result = await testRepository.exists(id);

      // Assert
      expect(result).toBe(false);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const id = 'test-id';
      const dbError = new Error('Database connection failed');
      mockRepository.count.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.exists(id)).rejects.toThrow(DatabaseError);
    });
  });

  describe('findAndCount', () => {
    it('should find and count entities without options', async () => {
      // Arrange
      const mockEntities = [
        new TestEntity({ id: '1', name: 'Test1', email: 'test1@example.com' }),
        new TestEntity({ id: '2', name: 'Test2', email: 'test2@example.com' })
      ];
      const expectedCount = 2;
      mockRepository.findAndCount.mockResolvedValue([mockEntities, expectedCount]);

      // Act
      const result = await testRepository.findAndCount();

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockEntities, expectedCount]);
    });

    it('should find and count entities with options', async () => {
      // Arrange
      const options: FindManyOptions<TestEntity> = {
        where: { name: 'Test' },
        order: { name: 'ASC' }
      };
      const mockEntities = [
        new TestEntity({ id: '1', name: 'Test', email: 'test@example.com' })
      ];
      const expectedCount = 1;
      mockRepository.findAndCount.mockResolvedValue([mockEntities, expectedCount]);

      // Act
      const result = await testRepository.findAndCount(options);

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([mockEntities, expectedCount]);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockRepository.findAndCount.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.findAndCount()).rejects.toThrow(DatabaseError);
    });
  });

  describe('saveMany', () => {
    it('should save multiple entities successfully', async () => {
      // Arrange
      const entities = [
        new TestEntity({ id: '1', name: 'Test1', email: 'test1@example.com' }),
        new TestEntity({ id: '2', name: 'Test2', email: 'test2@example.com' })
      ];
      const savedEntities = [
        new TestEntity({ id: '1', name: 'Test1', email: 'test1@example.com' }),
        new TestEntity({ id: '2', name: 'Test2', email: 'test2@example.com' })
      ];
      (mockRepository.save as jest.Mock).mockResolvedValue(savedEntities);

      // Act
      const result = await testRepository.saveMany(entities);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(entities);
      expect(result).toEqual(savedEntities);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const entities = [
        new TestEntity({ id: '1', name: 'Test1', email: 'test1@example.com' })
      ];
      const dbError = new Error('Database connection failed');
      (mockRepository.save as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.saveMany(entities)).rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple entities successfully', async () => {
      // Arrange
      const ids = ['1', '2', '3'];
      mockRepository.delete.mockResolvedValue({ affected: 3 } as any);

      // Act
      await testRepository.deleteMany(ids);

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(ids);
    });

    it('should throw DatabaseError when database error occurs', async () => {
      // Arrange
      const ids = ['1'];
      const dbError = new Error('Database connection failed');
      mockRepository.delete.mockRejectedValue(dbError);

      // Act & Assert
      await expect(testRepository.deleteMany(ids)).rejects.toThrow(DatabaseError);
    });
  });
}); 