describe('Simple Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  it('should handle object equality', () => {
    const obj1 = { name: 'test', value: 123 };
    const obj2 = { name: 'test', value: 123 };
    expect(obj1).toEqual(obj2);
  });
}); 