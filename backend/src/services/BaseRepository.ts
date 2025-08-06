import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions, ObjectLiteral, DeepPartial } from 'typeorm';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';
import { NotFoundError, DatabaseError } from '../utils/errors';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;
  protected entityName: string;

  constructor(entity: new () => T) {
    this.repository = AppDataSource.getRepository(entity) as Repository<T>;
    this.entityName = entity.name;
  }

  /**
   * Trouver une entité par son ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const startTime = Date.now();
      const result = await this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<T> });
      const duration = Date.now() - startTime;
      
      logger.db('findById', this.entityName, duration);
      
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la recherche par ID dans ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la recherche de ${this.entityName}`);
    }
  }

  /**
   * Trouver toutes les entités avec options
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    try {
      const startTime = Date.now();
      const result = await this.repository.find(options);
      const duration = Date.now() - startTime;
      
      logger.db('findAll', this.entityName, duration);
      
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la recherche de toutes les ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la recherche de ${this.entityName}`);
    }
  }

  /**
   * Trouver une entité avec options
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    try {
      const startTime = Date.now();
      const result = await this.repository.findOne(options);
      const duration = Date.now() - startTime;
      
      logger.db('findOne', this.entityName, duration);
      
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la recherche d'une ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la recherche de ${this.entityName}`);
    }
  }

  /**
   * Sauvegarder une entité
   */
  async save(entity: T): Promise<T> {
    try {
      const startTime = Date.now();
      const result = await this.repository.save(entity);
      const duration = Date.now() - startTime;
      
      logger.db('save', this.entityName, duration);
      
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la sauvegarde de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la sauvegarde de ${this.entityName}`);
    }
  }

  /**
   * Créer une nouvelle entité
   */
  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.save(entity);
    } catch (error) {
      logger.error(`Erreur lors de la création de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la création de ${this.entityName}`);
    }
  }

  /**
   * Mettre à jour une entité
   */
  async update(id: string, data: DeepPartial<T>): Promise<T> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new NotFoundError(`${this.entityName} non trouvé`);
      }

      Object.assign(entity, data);
      return await this.save(entity);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(`Erreur lors de la mise à jour de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la mise à jour de ${this.entityName}`);
    }
  }

  /**
   * Supprimer une entité
   */
  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new NotFoundError(`${this.entityName} non trouvé`);
      }

      const startTime = Date.now();
      await this.repository.remove(entity);
      const duration = Date.now() - startTime;
      
      logger.db('delete', this.entityName, duration);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(`Erreur lors de la suppression de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la suppression de ${this.entityName}`);
    }
  }

  /**
   * Compter les entités
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    try {
      const startTime = Date.now();
      const result = await this.repository.count(options);
      const duration = Date.now() - startTime;
      
      logger.db('count', this.entityName, duration);
      
      return result;
    } catch (error) {
      logger.error(`Erreur lors du comptage de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors du comptage de ${this.entityName}`);
    }
  }

  /**
   * Vérifier si une entité existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: { id } as unknown as FindOptionsWhere<T> });
      return count > 0;
    } catch (error) {
      logger.error(`Erreur lors de la vérification d'existence de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la vérification d'existence de ${this.entityName}`);
    }
  }

  /**
   * Trouver et compter avec pagination
   */
  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    try {
      const startTime = Date.now();
      const result = await this.repository.findAndCount(options);
      const duration = Date.now() - startTime;
      
      logger.db('findAndCount', this.entityName, duration);
      
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la recherche et comptage de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la recherche et comptage de ${this.entityName}`);
    }
  }

  /**
   * Sauvegarder plusieurs entités
   */
  async saveMany(entities: T[]): Promise<T[]> {
    try {
      const startTime = Date.now();
      const result = await this.repository.save(entities);
      const duration = Date.now() - startTime;
      
      logger.db('saveMany', this.entityName, duration);
      
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la sauvegarde multiple de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la sauvegarde multiple de ${this.entityName}`);
    }
  }

  /**
   * Supprimer plusieurs entités
   */
  async deleteMany(ids: string[]): Promise<void> {
    try {
      const startTime = Date.now();
      await this.repository.delete(ids);
      const duration = Date.now() - startTime;
      
      logger.db('deleteMany', this.entityName, duration);
    } catch (error) {
      logger.error(`Erreur lors de la suppression multiple de ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`);
      throw new DatabaseError(`Erreur lors de la suppression multiple de ${this.entityName}`);
    }
  }
} 