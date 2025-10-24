# Java 字符串处理

## 定义与作用
字符串是 Java 中最常用的数据类型之一，用于表示文本数据。Java 提供了 String、StringBuffer 和 StringBuilder 三个类来处理字符串，它们各有不同的特性和适用场景。

## String 类

### 定义与特性
String 类表示不可变的字符序列，是 Java 中最基本的字符串类型。

#### 不可变性
- **定义**：String 对象一旦创建，其内容就不能被修改
- **实现原理**：内部使用 final char[] 数组存储字符
- **优势**：
  - 线程安全
  - 可以作为 HashMap 的键
  - 字符串常量池优化

```java
public class StringImmutability {
    public static void main(String[] args) {
        String str1 = "Hello";
        String str2 = str1;
        
        str1 = str1 + " World";  // 创建新对象，原对象不变
        
        System.out.println("str1: " + str1);  // Hello World
        System.out.println("str2: " + str2);  // Hello
        System.out.println(str1 == str2);      // false
    }
}
```

#### 字符串常量池
- **作用**：避免重复创建相同的字符串对象
- **位置**：方法区（Java 8 之前）或堆内存（Java 8 之后）
- **intern() 方法**：将字符串添加到常量池

```java
public class StringPool {
    public static void main(String[] args) {
        String str1 = "Hello";           // 常量池
        String str2 = "Hello";           // 常量池，复用str1
        String str3 = new String("Hello"); // 堆内存，新对象
        
        System.out.println(str1 == str2);  // true
        System.out.println(str1 == str3);  // false
        System.out.println(str1.equals(str3)); // true
        
        String str4 = str3.intern();      // 加入常量池
        System.out.println(str1 == str4); // true
    }
}
```

### 常用方法

#### 字符串创建与初始化
```java
// 字面量方式（推荐）
String str1 = "Hello World";

// 构造器方式
String str2 = new String("Hello World");

// 字符数组
char[] chars = {'H', 'e', 'l', 'l', 'o'};
String str3 = new String(chars);

// 字节数组（指定编码）
byte[] bytes = {72, 101, 108, 108, 111};
String str4 = new String(bytes, StandardCharsets.UTF_8);
```

#### 字符串操作
```java
public class StringOperations {
    public static void main(String[] args) {
        String text = "Hello Java World";
        
        // 长度和空值检查
        System.out.println("长度: " + text.length());
        System.out.println("是否为空: " + text.isEmpty());
        System.out.println("是否空白: " + text.isBlank());
        
        // 查找
        System.out.println("包含Java: " + text.contains("Java"));
        System.out.println("Java位置: " + text.indexOf("Java"));
        System.out.println("最后o位置: " + text.lastIndexOf('o'));
        
        // 截取
        System.out.println("子串: " + text.substring(6, 10));  // Java
        
        // 替换
        System.out.println("替换: " + text.replace("Java", "Python"));
        
        // 分割
        String[] words = text.split(" ");
        System.out.println("单词数: " + words.length);
        
        // 大小写转换
        System.out.println("大写: " + text.toUpperCase());
        System.out.println("小写: " + text.toLowerCase());
        
        // 去除空格
        String spaced = "  Hello  ";
        System.out.println("去空格: '" + spaced.trim() + "'");
        
        // 格式化
        String formatted = String.format("姓名: %s, 年龄: %d", "张三", 25);
        System.out.println(formatted);
    }
}
```

#### 字符串比较
```java
public class StringComparison {
    public static void main(String[] args) {
        String str1 = "Hello";
        String str2 = "hello";
        String str3 = "Hello";
        
        // == 比较引用地址
        System.out.println("str1 == str2: " + (str1 == str2));  // false
        System.out.println("str1 == str3: " + (str1 == str3));  // true
        
        // equals 比较内容
        System.out.println("str1.equals(str2): " + str1.equals(str2));  // false
        System.out.println("str1.equals(str3): " + str1.equals(str3));  // true
        
        // equalsIgnoreCase 忽略大小写
        System.out.println("str1.equalsIgnoreCase(str2): " + str1.equalsIgnoreCase(str2));  // true
        
        // compareTo 字典序比较
        System.out.println("str1.compareTo(str2): " + str1.compareTo(str2));  // 负数
        System.out.println("str2.compareTo(str1): " + str2.compareTo(str1));  // 正数
    }
}
```

## StringBuffer 类

### 定义与特性
StringBuffer 表示可变的字符序列，是线程安全的字符串操作类。

#### 线程安全性
- **实现原理**：所有方法都使用 synchronized 关键字修饰
- **适用场景**：多线程环境下的字符串操作
- **性能影响**：同步操作会带来一定的性能开销

```java
public class StringBufferExample {
    public static void main(String[] args) {
        StringBuffer buffer = new StringBuffer();
        
        // 追加操作
        buffer.append("Hello");
        buffer.append(" ");
        buffer.append("World");
        
        System.out.println("内容: " + buffer.toString());  // Hello World
        System.out.println("长度: " + buffer.length());    // 11
        System.out.println("容量: " + buffer.capacity());  // 16（默认）
        
        // 插入操作
        buffer.insert(5, " Java");
        System.out.println("插入后: " + buffer);  // Hello Java World
        
        // 删除操作
        buffer.delete(5, 10);
        System.out.println("删除后: " + buffer);  // Hello World
        
        // 替换操作
        buffer.replace(6, 11, "Java");
        System.out.println("替换后: " + buffer);  // Hello Java
        
        // 反转操作
        buffer.reverse();
        System.out.println("反转后: " + buffer);  // avaJ olleH
    }
}
```

### 容量管理
StringBuffer 使用动态数组实现，会自动扩容。

```java
public class StringBufferCapacity {
    public static void main(String[] args) {
        // 指定初始容量
        StringBuffer buffer = new StringBuffer(10);
        System.out.println("初始容量: " + buffer.capacity());  // 10
        
        // 添加内容超过容量时自动扩容
        buffer.append("Hello World Java");
        System.out.println("扩容后容量: " + buffer.capacity());  // 22（(10+1)*2）
        
        // 手动设置容量
        buffer.ensureCapacity(50);
        System.out.println("确保容量后: " + buffer.capacity());  // 50
        
        // 压缩容量
        buffer.trimToSize();
        System.out.println("压缩后容量: " + buffer.capacity());  // 16（实际内容长度）
    }
}
```

## StringBuilder 类

### 定义与特性
StringBuilder 表示可变的字符序列，是非线程安全的字符串操作类。

#### 非线程安全性
- **实现原理**：方法没有同步控制
- **适用场景**：单线程环境下的字符串操作
- **性能优势**：比 StringBuffer 更快

```java
public class StringBuilderExample {
    public static void main(String[] args) {
        StringBuilder builder = new StringBuilder();
        
        // 链式调用（方法返回this）
        builder.append("Hello")
               .append(" ")
               .append("World")
               .append("!");
        
        System.out.println("内容: " + builder);  // Hello World!
        
        // 性能测试：StringBuilder vs StringBuffer
        int iterations = 100000;
        
        // StringBuilder 测试
        long startTime = System.currentTimeMillis();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < iterations; i++) {
            sb.append(i);
        }
        long sbTime = System.currentTimeMillis() - startTime;
        
        // StringBuffer 测试
        startTime = System.currentTimeMillis();
        StringBuffer sbf = new StringBuffer();
        for (int i = 0; i < iterations; i++) {
            sbf.append(i);
        }
        long sbfTime = System.currentTimeMillis() - startTime;
        
        System.out.println("StringBuilder 耗时: " + sbTime + "ms");
        System.out.println("StringBuffer 耗时: " + sbfTime + "ms");
    }
}
```

## 三者的对比分析

### 特性对比

| 特性 | String | StringBuffer | StringBuilder |
|------|--------|--------------|---------------|
| 可变性 | 不可变 | 可变 | 可变 |
| 线程安全 | 是（不可变） | 是（同步） | 否 |
| 性能 | 中等 | 较低 | 最高 |
| 内存使用 | 较高（常量池） | 中等 | 中等 |
| 适用场景 | 常量字符串、键值 | 多线程环境 | 单线程环境 |

### 性能对比
```java
public class PerformanceComparison {
    public static void main(String[] args) {
        final int ITERATIONS = 10000;
        
        // String 拼接性能
        long start = System.currentTimeMillis();
        String str = "";
        for (int i = 0; i < ITERATIONS; i++) {
            str += i;  // 每次创建新对象
        }
        long stringTime = System.currentTimeMillis() - start;
        
        // StringBuffer 性能
        start = System.currentTimeMillis();
        StringBuffer buffer = new StringBuffer();
        for (int i = 0; i < ITERATIONS; i++) {
            buffer.append(i);
        }
        long bufferTime = System.currentTimeMillis() - start;
        
        // StringBuilder 性能
        start = System.currentTimeMillis();
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < ITERATIONS; i++) {
            builder.append(i);
        }
        long builderTime = System.currentTimeMillis() - start;
        
        System.out.println("String 拼接耗时: " + stringTime + "ms");
        System.out.println("StringBuffer 耗时: " + bufferTime + "ms");
        System.out.println("StringBuilder 耗时: " + builderTime + "ms");
    }
}
```

### 选择指南

#### 使用 String 的情况
1. **字符串常量**：不需要修改的字符串
2. **HashMap 键**：利用不可变性保证键的唯一性
3. **配置信息**：程序运行期间不变的字符串
4. **少量拼接**：拼接次数很少的场景

#### 使用 StringBuffer 的情况
1. **多线程环境**：多个线程需要操作同一个字符串
2. **线程安全要求**：对线程安全有严格要求的场景
3. **性能要求不高**：可以接受同步带来的性能损失

#### 使用 StringBuilder 的情况
1. **单线程环境**：只有一个线程操作字符串
2. **大量拼接**：需要频繁进行字符串拼接
3. **性能要求高**：对性能有较高要求的场景
4. **方法内部**：在方法内部使用的临时字符串

## 最佳实践

### 字符串拼接优化
```java
public class StringOptimization {
    // 不推荐：使用 + 进行大量拼接
    public static String badConcat(String[] words) {
        String result = "";
        for (String word : words) {
            result += word;  // 每次循环创建新String对象
        }
        return result;
    }
    
    // 推荐：使用 StringBuilder
    public static String goodConcat(String[] words) {
        StringBuilder builder = new StringBuilder();
        for (String word : words) {
            builder.append(word);
        }
        return builder.toString();
    }
    
    // 推荐：使用 String.join（Java 8+）
    public static String bestConcat(String[] words) {
        return String.join("", words);
    }
}
```

### 字符串比较优化
```java
public class StringCompareOptimization {
    // 不推荐：可能空指针异常
    public static boolean badEquals(String str1, String str2) {
        return str1.equals(str2);
    }
    
    // 推荐：处理空值
    public static boolean goodEquals(String str1, String str2) {
        if (str1 == str2) return true;  // 同一对象或都为null
        if (str1 == null || str2 == null) return false;
        return str1.equals(str2);
    }
    
    // 推荐：使用 Objects.equals（Java 7+）
    public static boolean bestEquals(String str1, String str2) {
        return Objects.equals(str1, str2);
    }
}
```

### 字符串常量使用
```java
public class StringConstants {
    // 不推荐：每次创建新对象
    public void processString(String input) {
        if (input.equals(new String("test"))) {  // 创建不必要的对象
            // ...
        }
    }
    
    // 推荐：使用字符串常量
    public void processStringOptimized(String input) {
        if ("test".equals(input)) {  // 使用字面量
            // ...
        }
    }
    
    // 推荐：定义常量
    private static final String TEST_CONSTANT = "test";
    
    public void processStringWithConstant(String input) {
        if (TEST_CONSTANT.equals(input)) {
            // ...
        }
    }
}
```

## 总结
Java 提供了三种字符串处理类，各有不同的特性和适用场景：
- **String**：不可变，线程安全，适合常量字符串
- **StringBuffer**：可变，线程安全，适合多线程环境
- **StringBuilder**：可变，非线程安全，性能最高，适合单线程环境

在实际开发中，应根据具体需求选择合适的字符串类，并遵循最佳实践来优化性能和提高代码质量。