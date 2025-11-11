# 7-String

## 定义与作用

字符串是 Java 中最常用的数据类型之一，用于表示文本数据。Java 提供了 `String`、`StringBuffer` 和 `StringBuilder` 三个类来处理字符串，它们各有不同的特性和适用场景。

## String 类

### 定义与特性

`String` 类表示不可变的字符序列，是 Java 中最基本的字符串类型。

#### 不可变性

- **定义**：String 对象一旦创建，其内容就不能被修改

- **实现原理**：内部使用 `final char[]` 数组存储字符

- **优势**：线程安全、可作为 HashMap 键、支持字符串常量池优化

```Plain Text

public class StringImmutability {
    public static void main(String[] args) {
        String str1 = "Hello";
        String str2 = str1;
        str1 = str1 + " World";  // 创建新对象，原对象不变
        System.out.println("str1: " + str1);  // Hello World
        System.out.println("str2: " + str2);  // Hello
        System.out.println(str1 == str2);      // false（引用不同对象）
    }
}
// 补充：JDK 8对字符串相加的优化
// 编译期会将多个+拼接自动转换为StringBuilder.append()，减少临时对象创建
// 例：String a = "a" + "b" + "c"; 编译后等价于：
// String a = new StringBuilder().append("a").append("b").append("c").toString();
// 注意：循环内的+拼接仍需手动用StringBuilder，编译期无法优化循环内逻辑
```

#### 字符串常量池

- **作用**：避免重复创建相同的字符串对象，节省内存

- **位置**：方法区（Java 8 之前）或堆内存（Java 8 之后）

- **intern() 方法**：将字符串对象加入常量池并返回池内引用

```java

public class StringPool {
    public static void main(String[] args) {
        String str1 = "Hello";           // 常量池对象
        String str2 = new String("Hello"); // 堆内存新对象
        System.out.println(str1 == str2);  // false（引用不同）
        System.out.println(str1.equals(str2)); // true（内容相同）
        String str3 = str2.intern();      // 加入常量池
        System.out.println(str1 == str3); // true（引用常量池对象）
    }
}
```

### 核心常用方法

```java

public class StringCoreMethods {
    public static void main(String[] args) {
        String text = "Hello Java World";
        // 基础操作：长度、查找、截取、替换、分割
        System.out.println("长度: " + text.length());
        System.out.println("Java位置: " + text.indexOf("Java"));
        System.out.println("子串: " + text.substring(6, 10)); // Java
        System.out.println("替换: " + text.replace("Java", "Python"));
        // 比较操作
        String str1 = "Hello", str2 = "hello";
        System.out.println(str1.equals(str2)); // false（区分大小写）
        System.out.println(str1.equalsIgnoreCase(str2)); // true（忽略大小写）
        System.out.println(str1.compareTo(str2)); // 负数（字典序靠前）
    }
}
```

## StringBuffer 类

### 定义与特性

`StringBuffer` 表示可变的字符序列，核心特点是**线程安全**，通过 `synchronized` 修饰方法实现，适合多线程环境，但同步操作会带来性能开销。

```java

public class StringBufferDemo {
    public static void main(String[] args) {
        StringBuffer buffer = new StringBuffer("Hello");
        buffer.append(" World") // 追加
              .insert(5, " Java") // 插入
              .replace(6, 11, "C++") // 替换
              .delete(5, 8); // 删除
        System.out.println(buffer); // Hello C++ World
        System.out.println(buffer.reverse()); // dlroW ++C olleH
    }
}
```

## StringBuilder 类

### 定义与特性

`StringBuilder` 与 `StringBuffer` 功能一致，均为可变字符序列，但**去除了线程同步**，性能更优，是单线程环境（如方法内部临时拼接）的首选。

```java

public class StringBuilderDemo {
    public static void main(String[] args) {
        // 链式调用更简洁
        StringBuilder builder = new StringBuilder()
            .append("Hello")
            .append(" ")
            .append("StringBuilder");
        System.out.println(builder); // Hello StringBuilder
        // 性能优势：单线程下比StringBuffer快
    }
}
```

## 三者核心对比与选择

|特性|String|StringBuffer|StringBuilder|
|---|---|---|---|
|可变性|不可变|可变|可变|
|线程安全|是（不可变天然安全）|是（同步）|否|
|性能|低（频繁拼接创建新对象）|中（同步开销）|高（无同步）|
|适用场景|常量、键值、少量操作|多线程环境|单线程、大量拼接|
## 总结

Java 字符串处理类的选择核心是**场景匹配**：

- **String**：优先用于无需修改的常量、HashMap 键等场景，利用不可变性保证安全和优化

- **StringBuffer**：仅在多线程必须共享字符串时使用，牺牲性能换安全

- **StringBuilder**：单线程下的首选，尤其适合大量拼接操作，兼顾简洁与性能

遵循最佳实践可有效减少内存浪费和空指针风险，提升代码质量。