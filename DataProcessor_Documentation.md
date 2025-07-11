# DataProcessor Class Documentation

## Overview

The `DataProcessor` class is a comprehensive data processing utility designed to handle various data operations on numeric datasets. It provides a flexible interface for loading data from different sources and performing common mathematical operations.

## Class Structure

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                DataProcessor                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Attributes:                                                                         │
│ + data_source: Union[str, dict, List[Any]]                                         │
│ + processed_data: Optional[Union[int, float]]                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Methods:                                                                            │
│ + __init__(data_source: Union[str, dict, List[Any]]) -> None                       │
│ + load_data() -> List[Union[int, float]]                                           │
│ + process(operation: str) -> Optional[Union[int, float]]                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## API Reference

### Constructor

#### `__init__(data_source: Union[str, dict, List[Any]]) -> None`

Initializes the DataProcessor with a data source.

**Parameters:**
- `data_source`: The source of data to process. Accepts:
  - `str`: File path or URL to data source
  - `dict`: Configuration dictionary for data source
  - `List[Any]`: Direct data list to process

**Example:**
```python
# Initialize with file path
processor = DataProcessor("data.csv")

# Initialize with configuration
processor = DataProcessor({"type": "api", "endpoint": "https://api.com/data"})

# Initialize with direct data
processor = DataProcessor([1, 2, 3, 4, 5])
```

### Methods

#### `load_data() -> List[Union[int, float]]`

Loads data from the configured data source.

**Returns:**
- `List[Union[int, float]]`: A list of numeric data points loaded from the source

**Raises:**
- `ValueError`: If the data source is invalid or cannot be loaded
- `IOError`: If there's an error reading from the data source

**Example:**
```python
processor = DataProcessor("data.csv")
data = processor.load_data()
print(data)  # Output: [1, 2, 3, 4, 5]
```

#### `process(operation: str) -> Optional[Union[int, float]]`

Processes the loaded data using the specified operation.

**Parameters:**
- `operation`: The operation to perform on the data. Supported values:
  - `"sum"`: Calculate the sum of all values
  - `"average"`: Calculate the arithmetic mean
  - `"max"`: Find the maximum value

**Returns:**
- `Optional[Union[int, float]]`: The result of the operation, or None if the operation is not supported

**Raises:**
- `ValueError`: If the operation is not supported or if calculating max on empty data
- `ZeroDivisionError`: If calculating average on empty data

**Example:**
```python
processor = DataProcessor("data.csv")

# Calculate sum
sum_result = processor.process("sum")
print(sum_result)  # Output: 15

# Calculate average
avg_result = processor.process("average")
print(avg_result)  # Output: 3.0

# Find maximum
max_result = processor.process("max")
print(max_result)  # Output: 5

# Invalid operation
invalid_result = processor.process("invalid")
print(invalid_result)  # Output: None
```

## Usage Examples

### Basic Usage

```python
from typing import Any, List, Optional, Union

# Create a processor with direct data
processor = DataProcessor([10, 20, 30, 40, 50])

# Perform various operations
total = processor.process("sum")        # Returns: 150
average = processor.process("average")  # Returns: 30.0
maximum = processor.process("max")      # Returns: 50
```

### Advanced Usage with Different Data Sources

```python
# File-based data source
file_processor = DataProcessor("sales_data.csv")
monthly_total = file_processor.process("sum")

# API-based data source
api_processor = DataProcessor({
    "type": "api",
    "endpoint": "https://api.company.com/metrics",
    "headers": {"Authorization": "Bearer token"}
})
api_average = api_processor.process("average")

# Database configuration
db_processor = DataProcessor({
    "type": "database",
    "connection": "postgresql://user:pass@localhost/db",
    "query": "SELECT value FROM metrics WHERE date > '2023-01-01'"
})
db_max = db_processor.process("max")
```

### Error Handling

```python
try:
    processor = DataProcessor([])
    result = processor.process("average")
except ZeroDivisionError as e:
    print(f"Error: {e}")  # Output: Error: Cannot calculate average of empty data

try:
    processor = DataProcessor([1, 2, 3])
    result = processor.process("median")  # Unsupported operation
    if result is None:
        print("Operation not supported")
except ValueError as e:
    print(f"Error: {e}")
```

## Attributes

### `data_source: Union[str, dict, List[Any]]`
The source of data to process. Can be a file path, configuration dictionary, or direct data list.

### `processed_data: Optional[Union[int, float]]`
Cached result of the last processing operation. Initially None, updated after each successful process() call.

## Exception Handling

The class provides comprehensive error handling for various scenarios:

- **`ValueError`**: Raised when the data source is invalid or when trying to find maximum of empty data
- **`IOError`**: Raised when there's an error reading from the data source
- **`ZeroDivisionError`**: Raised when calculating average on empty data

## Best Practices

1. **Always handle exceptions** when working with external data sources
2. **Check return values** from process() method as it may return None for unsupported operations
3. **Use appropriate data source types** based on your use case
4. **Cache results** by accessing the `processed_data` attribute to avoid recomputation

## Extension Points

The class can be extended to support additional operations:

```python
class ExtendedDataProcessor(DataProcessor):
    def process(self, operation: str) -> Optional[Union[int, float]]:
        # Call parent method first
        result = super().process(operation)
        if result is not None:
            return result
        
        # Add custom operations
        data = self.load_data()
        if operation == "median":
            sorted_data = sorted(data)
            n = len(sorted_data)
            if n % 2 == 0:
                return (sorted_data[n//2-1] + sorted_data[n//2]) / 2
            else:
                return sorted_data[n//2]
        elif operation == "min":
            return min(data) if data else None
        
        return None
```

## Integration Examples

### With FastAPI

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class ProcessRequest(BaseModel):
    data_source: Union[str, dict, List[float]]
    operation: str

@app.post("/process")
async def process_data(request: ProcessRequest):
    try:
        processor = DataProcessor(request.data_source)
        result = processor.process(request.operation)
        if result is None:
            raise HTTPException(status_code=400, detail="Unsupported operation")
        return {"result": result}
    except (ValueError, ZeroDivisionError) as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### With Async Processing

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def process_data_async(data_source, operation):
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        processor = DataProcessor(data_source)
        result = await loop.run_in_executor(executor, processor.process, operation)
        return result
```

## Testing

The class is designed to be easily testable:

```python
import pytest

def test_data_processor_sum():
    processor = DataProcessor([1, 2, 3, 4, 5])
    assert processor.process("sum") == 15

def test_data_processor_average():
    processor = DataProcessor([2, 4, 6, 8, 10])
    assert processor.process("average") == 6.0

def test_data_processor_max():
    processor = DataProcessor([1, 5, 3, 9, 2])
    assert processor.process("max") == 9

def test_data_processor_invalid_operation():
    processor = DataProcessor([1, 2, 3])
    assert processor.process("invalid") is None

def test_data_processor_empty_data_average():
    processor = DataProcessor([])
    with pytest.raises(ZeroDivisionError):
        processor.process("average")
```

## Thread Safety

The current implementation is not thread-safe due to the mutable `processed_data` attribute. For concurrent usage, consider:

1. Using immutable operations that don't modify state
2. Implementing proper locking mechanisms
3. Creating separate instances for each thread

## Performance Considerations

- The `load_data()` method is called for each `process()` operation
- Consider caching loaded data for repeated operations
- For large datasets, consider implementing lazy loading or streaming
- Memory usage grows linearly with data size

## Version History

- **1.0.0**: Initial implementation with basic sum, average, and max operations
- **1.1.0**: Added comprehensive type hints and documentation
- **1.2.0**: Enhanced error handling and added usage examples