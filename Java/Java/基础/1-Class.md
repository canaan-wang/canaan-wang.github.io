# Class

## 一、基础认知

### 1.1 类的定义与作用

类是Java面向对象编程（OOP）的，是对现实世界中同一类事物的，包含事物的属性（数据）和行为（方法）。

例如：“学生”类可抽象为包含“姓名、学号”等属性，以及“学习、考试”等行为的代码模板。

**语法格式**：

```java

// 访问修饰符 关键字 类名
访问修饰符 class 类名 {
    // 类的属性（成员变量）
    // 类的方法（成员方法）
}
```

**关键说明**：

- 访问修饰符：可选项，包括public、default（无修饰符）、protected、private，控制类的访问权限

- class关键字：定义类的核心关键字，不可省略

- 类名：遵循“大驼峰命名法”（首字母大写，如Student、UserService），需与.java文件名一致（public类必须一致）

### 1.2 类与对象的关系

类是（抽象概念），对象是类的（具体存在的实体）。通过“new关键字+构造方法”创建对象。

```java

// 定义类（模板）
public class Student {
    String name; // 属性
}
// 创建对象（实例）
Student stu = new Student();
```


      核心区别：一个类可创建多个对象，对象的属性值独立（如两个Student对象可分别有“张三”“李四”的姓名）
    

## 二、Java类的核心结构

一个完整的Java类包含：成员变量、构造方法、成员方法、代码块、内部类五大核心部分，结构如下：

```java

public class ClassStructure {
    // 1. 成员变量（属性）
    private String name;
    public int age;
    
    // 2. 构造方法
    public ClassStructure() {} // 无参构造
    public ClassStructure(String name, int age) { // 有参构造
        this.name = name;
        this.age = age;
    }
    
    // 3. 成员方法
    public void showInfo() {
        System.out.println(name + "," + age);
    }
    
    // 4. 代码块
    static { // 静态代码块
        System.out.println("静态代码块执行");
    }
    
    { // 实例代码块
        System.out.println("实例代码块执行");
    }
    
    // 5. 内部类
    class InnerClass {
        public void innerMethod() {}
    }
}
```

### 2.1 成员变量（属性）

用于存储类的状态数据，分为“实例变量”和“静态变量”，核心区别如下表：

|类型|定义关键字|归属|访问方式|初始化值|
|---|---|---|---|---|
|实例变量|无static|对象|对象名.变量名|默认初始化（如int为0，String为null）|
|静态变量|有static|类|类名.变量名（推荐）/对象名.变量名|默认初始化，且只初始化一次|
**命名规范**：小驼峰命名法（如userName、studentAge），避免使用关键字。

### 2.2 构造方法

用于对象的初始化，是创建对象时必须调用的特殊方法，核心特性：

- **方法名与类名完全一致**，无返回值类型（连void都不能写）

- 若未显式定义构造方法，编译器会自动生成

- 若显式定义了构造方法，默认无参构造会“失效”，需手动添加（否则无法用new 类名()创建对象）

- 支持（同一类中，参数列表不同的多个构造方法）

```java

public class Person {
    String name;
    int age;
    
    // 无参构造（手动添加，避免显式定义有参后默认构造失效）
    public Person() {}
    
    // 有参构造1（单参数）
    public Person(String name) {
        this.name = name; // this指代当前对象，区分成员变量和局部变量
    }
    
    // 有参构造2（双参数，构造重载）
    public Person(String name, int age) {
        this(name); // 调用本类其他构造方法，必须在第一行
        this.age = age;
    }
}
```

### 2.3 成员方法

用于描述类的行为，分为“实例方法”和“静态方法”，语法及区别：

```java

public class MethodDemo {
    // 实例方法（无static）：依赖对象调用，可访问实例变量和静态变量
    public void instanceMethod() {
        System.out.println("实例方法");
    }
    
    // 静态方法（有static）：依赖类调用，只能访问静态变量
    public static void staticMethod() {
        System.out.println("静态方法");
    }
}
```

**核心区别**：

- 实例方法：有this指针（指代当前对象），非静态，需通过对象调用

- 静态方法：无this指针，静态，通过类名调用（如MethodDemo.staticMethod()），常用于工具类（如Math类的方法）

**方法重载（Overload）**：同一类中，方法名相同，参数列表（参数个数、类型、顺序）不同，与返回值无关。

**方法重写（Override）**：子类继承父类后，对父类的实例方法进行重新实现（方法名、参数列表、返回值完全一致），需符合里氏替换原则。

### 2.4 代码块

用于初始化操作，按类型分为4种，执行顺序是核心考点：

|类型|定义格式|执行时机|执行次数|
|---|---|---|---|
|静态代码块|static { ... }|类加载时执行（优先于其他代码块）|仅1次（类只加载一次）|
|实例代码块|{ ... }|对象创建时执行（在构造方法前）|每次创建对象都执行|
|构造代码块|即实例代码块，与实例代码块一致|同实例代码块|同实例代码块|
|局部代码块|方法内部的{ ... }|执行到该代码块时|每次执行到都执行|

      执行顺序：静态代码块 > 实例代码块 > 构造方法 > 局部代码块
    

### 2.5 内部类

定义在另一个类内部的类，分为4种类型，核心作用是实现“类的隐藏”和“逻辑内聚”：

- **成员内部类**：定义在类内部，无static修饰，依赖外部类对象，可访问外部类所有成员
        `public class Outer {
    class Inner { // 成员内部类
        public void show() {
            System.out.println("成员内部类");
        }
    }
    // 调用方式
    public static void main(String[] args) {
        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
        inner.show();
    }
}`

- **静态内部类**：定义在类内部，有static修饰，不依赖外部类对象，仅可访问外部类静态成员（最常用）
        `public class Outer {
    static class Inner { // 静态内部类
        public void show() {
            System.out.println("静态内部类");
        }
    }
    // 调用方式
    public static void main(String[] args) {
        Outer.Inner inner = new Outer.Inner();
        inner.show();
    }
}`

- **局部内部类**：定义在方法内部，作用域仅在方法内，不能用访问修饰符修饰

- **匿名内部类**：无类名的局部内部类，常用于快速创建接口或抽象类的实例（简化代码）
        `// 接口
interface Animal {
    void bark();
}
// 匿名内部类使用
public class Test {
    public static void main(String[] args) {
        Animal dog = new Animal() { // 匿名内部类
            @Override
            public void bark() {
                System.out.println("汪汪叫");
            }
        };
        dog.bark();
    }
}`

## 三、Java类的高级特性

### 3.1 访问修饰符

控制类及类成员的访问范围，4种修饰符的权限等级（从大到小）：public > protected > default > private

|修饰符|本类|同包|子类|其他包|
|---|---|---|---|---|
|public|√|√|√|√|
|protected|√|√|√|×|
|default（无修饰）|√|√|×|×|
|private|√|×|×|×|

      最佳实践：成员变量用private（封装），提供public的getter/setter方法访问；类用public或default，工具类的构造方法用private（防止实例化）
    

### 3.2 封装（Encapsulation）

OOP三大特性之一，核心是“隐藏内部细节，暴露安全接口”，实现步骤：

1. 用private修饰成员变量（禁止直接访问）

2. 提供public的getter方法（获取变量值）和setter方法（设置变量值，可添加校验逻辑）

```java

public class EncapsulationDemo {
    // 私有成员变量
    private String name;
    private int age;
    
    // getter方法（获取值）
    public String getName() {
        return name;
    }
    
    // setter方法（设置值，添加校验）
    public void setName(String name) {
        if (name != null && name.length() > 0) { // 校验非空
            this.name = name;
        } else {
            throw new IllegalArgumentException("姓名不能为空");
        }
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        if (age > 0 && age < 150) { // 校验年龄范围
            this.age = age;
        } else {
            throw new IllegalArgumentException("年龄不合法");
        }
    }
}
```

### 3.3 继承（Inheritance）

OOP三大特性之一，核心是“复用代码”，通过extends关键字实现，语法：`class 子类名 extends 父类名 {}`

**核心规则**：

- Java是单继承（一个子类只能有一个直接父类），但支持多层继承（如A extends B，B extends C）

- 子类继承父类的非private成员（成员变量和实例方法），静态成员也可继承

- 子类构造方法默认先调用父类的无参构造（通过super()实现，必须在子类构造第一行）

- super关键字：指代父类对象，可用于调用父类的构造方法（super(参数)）、成员变量（super.变量名）、成员方法（super.方法名()）

```java

// 父类
public class Father {
    String name;
    // 父类有参构造
    public Father(String name) {
        this.name = name;
    }
    public void work() {
        System.out.println("工作");
    }
}
// 子类
public class Son extends Father {
    int age;
    // 子类构造必须先调用父类构造
    public Son(String name, int age) {
        super(name); // 调用父类有参构造
        this.age = age;
    }
    // 重写父类方法
    @Override
    public void work() {
        super.work(); // 调用父类work方法
        System.out.println("子类工作");
    }
}
```

### 3.4 多态（Polymorphism）

OOP三大特性之一，核心是“同一行为，不同实现”，实现条件：

1. 有继承关系（子类继承父类）

2. 有方法重写

3. 父类引用指向子类对象（`父类名 变量名 = new 子类名()`）

```java

// 父类
public class Animal {
    public void bark() {
        System.out.println("动物叫");
    }
}
// 子类1
public class Dog extends Animal {
    @Override
    public void bark() {
        System.out.println("汪汪叫");
    }
}
// 子类2
public class Cat extends Animal {
    @Override
    public void bark() {
        System.out.println("喵喵叫");
    }
}
// 多态测试
public class PolymorphismTest {
    public static void main(String[] args) {
        Animal a1 = new Dog(); // 父类引用指向Dog对象
        Animal a2 = new Cat(); // 父类引用指向Cat对象
        a1.bark(); // 输出“汪汪叫”（调用子类实现）
        a2.bark(); // 输出“喵喵叫”（调用子类实现）
    }
}
```

**多态的好处**：降低代码耦合度，提高扩展性（新增子类时，无需修改调用代码）。

### 3.5 其他关键修饰符

- **final**：可修饰类、方法、变量
        修饰类：类不可被继承（如String类）

- 修饰方法：方法不可被重写

- 修饰变量：变量为常量，不可修改（必须初始化）

**abstract**：可修饰类、方法

- 修饰类：抽象类，不可实例化，需子类继承并实现抽象方法

- 修饰方法：抽象方法，无方法体，必须在抽象类中，子类必须重写（除非子类也是抽象类）

**static**：可修饰变量、方法、代码块、内部类，核心是“属于类，不属于对象”

## 四、注意事项

1. **类名与文件名一致**：public类的类名必须与.java文件名完全一致，否则编译报错

2. **构造方法规范**：显式定义构造方法时，务必手动添加无参构造（避免子类调用报错）

3. **封装最佳实践**：成员变量必用private，getter/setter方法用IDE自动生成（如IDEA的Alt+Insert）

4. **静态与非静态混用问题**：静态方法不能调用非静态成员（无this指针），非静态方法可调用静态成员

5. **内部类使用场景**：静态内部类用于工具类或与外部类逻辑紧密相关的类；匿名内部类用于简化接口/抽象类实例创建

6. **继承与组合选择**：“is-a”关系用继承（如Dog is a Animal），“has-a”关系用组合（如Person has a Car），组合比继承更灵活。


> （注：文档部分内容可能由 AI 生成）