# Class

# 一、基础认知

## 1.1 类的定义与作用

类是Java面向对象编程（OOP）的基石，是对同一类事物的抽象描述，包含事物的**属性（数据）**和**行为（方法）**，作为创建对象的模板。

**核心语法**：

```java

// 访问修饰符 关键字 类名
访问修饰符 class 类名 {
    成员变量; // 属性
    成员方法; // 行为
}
```

**关键规则**：

- 访问修饰符：控制访问权限（public、default、protected、private）

- 类名规范：大驼峰命名法（如Student），public类名必须与.java文件名一致

## 1.2 类与对象的关系

类是抽象概念，对象是类的具体实例；一个类可创建多个对象，对象属性值相互独立。

**核心关联**：通过`new 构造方法()`创建对象

```java

// 类（模板）
public class Student {
    String name; // 属性
}
// 对象（实例）
Student stu = new Student();
```

# 二、类的核心结构

完整类包含五大核心部分：成员变量、构造方法、成员方法、代码块、内部类，核心结构如下：

```java

public class ClassStructure {
    // 1. 成员变量（属性）
    private String name; // 实例变量
    public static int count; // 静态变量
    
    // 2. 构造方法（初始化对象）
    public ClassStructure() {} // 无参构造
    public ClassStructure(String name) { this.name = name; } // 有参构造
    
    // 3. 成员方法（行为）
    public void showInfo() {} // 实例方法
    public static void showCount() {} // 静态方法
    
    // 4. 代码块（初始化）
    static { System.out.println("静态代码块"); } // 静态代码块
    { System.out.println("实例代码块"); } // 实例代码块
    
    // 5. 内部类
    static class InnerClass {} // 静态内部类
    class MemberInner {} // 成员内部类
}
```

## 2.1 成员变量

存储类的状态数据，分为实例变量和静态变量，遵循小驼峰命名法。

|类型|标识|归属|访问方式|初始化|
|---|---|---|---|---|
|实例变量|无static|对象|对象名.变量名|默认初始化（int为0等）|
|静态变量|有static|类|类名.变量名（推荐）|默认初始化，仅1次|
## 2.2 构造方法

用于对象初始化的特殊方法，核心特性：

- 方法名与类名完全一致，无返回值类型（不含void）

- 未显式定义时，编译器自动生成无参构造

- 显式定义后默认无参构造失效，需手动添加

- 支持重载（参数列表不同），可通过`this(参数)`调用本类其他构造

## 2.3 成员方法

描述类的行为，分为实例方法和静态方法，核心区别如下：

|类型|标识|this指针|调用方式|访问范围|
|---|---|---|---|---|
|实例方法|无static|有|对象名.方法名()|实例变量+静态变量|
|静态方法|有static|无|类名.方法名()|仅静态变量|
**关键概念**：

- 重载（Overload）：同类中方法名相同，参数列表不同（与返回值无关）

- 重写（Override）：子类重写父类实例方法，方法签名完全一致（遵循里氏替换原则）

## 2.4 代码块

用于初始化操作，核心是执行顺序，分为四类：

|类型|定义格式|执行时机|执行次数|
|---|---|---|---|
|静态代码块|static { ... }|类加载时（最早）|仅1次|
|实例代码块|{ ... }|对象创建时（构造前）|每次创建对象|
|局部代码块|方法内{ ... }|执行到该代码块时|每次执行到|
执行顺序：静态代码块 > 实例代码块 > 构造方法 > 局部代码块

## 2.5 内部类

定义在类内部的类，核心作用是隐藏和逻辑内聚，常用两类：

- **静态内部类**：有static修饰，不依赖外部类对象，仅访问外部类静态成员（最常用）
        `public class Outer {
    static class Inner {}
    // 调用：Outer.Inner inner = new Outer.Inner();
` `}`

- **匿名内部类**：无类名，快速创建接口/抽象类实例
        `interface Animal { void bark(); }
// 使用：
Animal dog = new Animal() {
    @Override
    public void bark() { System.out.println("汪汪叫"); }
};`

# 三、类的高级特性

## 3.1 访问修饰符

控制类及成员的访问范围，权限从大到小：public > protected > default > private

|修饰符|本类|同包|子类|其他包|
|---|---|---|---|---|
|public|√|√|√|√|
|protected|√|√|√|×|
|default|√|√|×|×|
|private|√|×|×|×|
最佳实践：成员变量用private封装，提供public的getter/setter；工具类构造方法用private防止实例化

## 3.2 OOP三大特性

### 3.2.1 封装（Encapsulation）

核心：隐藏内部细节，暴露安全接口。实现步骤：

1. private修饰成员变量，禁止直接访问

2. 提供public的getter（获取）和setter（设置，可加校验）方法

```java

public class EncapsulationDemo {
    private int age; // 私有变量
    // setter加校验
    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        } else {
            throw new IllegalArgumentException("年龄不合法");
        }
    }
    // getter获取
    public int getAge() { return age; }
}
```

### 3.2.2 继承（Inheritance）

核心：复用代码，通过`extends`实现（单继承，支持多层继承）。核心规则：

- 子类继承父类非private成员，静态成员可继承

- 子类构造默认先调用父类无参构造（`super()`，需在第一行）

- `super`关键字：调用父类构造、成员变量、方法

### 3.2.3 多态（Polymorphism）

核心：同一行为，不同实现。实现三条件：继承、方法重写、父类引用指向子类对象。

```java

// 父类
public class Animal { public void bark() {} }
// 子类
public class Dog extends Animal {
    @Override
    public void bark() { System.out.println("汪汪叫"); }
}
// 多态使用
Animal a = new Dog(); // 父类引用指向子类对象
a.bark(); // 调用子类实现，输出"汪汪叫"
```

好处：降低耦合，提高扩展性（新增子类无需修改调用代码）。

## 3.3 关键修饰符

|修饰符|可修饰对象|核心作用|
|---|---|---|
|final|类、方法、变量|类不可继承；方法不可重写；变量为常量不可修改|
|abstract|类、方法|类不可实例化；方法无体，子类必须重写|
|static|变量、方法、代码块、内部类|属于类，不属于对象，仅加载一次|
# 四、核心注意事项

- 类名规范：public类名必须与.java文件名完全一致，否则编译报错

- 构造方法：显式定义时务必手动添加无参构造，避免子类调用失败

- 静态混用：静态方法不能调用非静态成员，非静态可调用静态成员

- 继承vs组合："is-a"用继承（Dog is a Animal），"has-a"用组合（Person has a Car），组合更灵活

- 内部类场景：静态内部类用于工具类；匿名内部类简化接口实例创建