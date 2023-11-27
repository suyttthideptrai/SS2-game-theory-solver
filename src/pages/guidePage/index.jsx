import React from 'react';
import './style.scss';
import { useRef, useContext, useEffect, useState } from 'react'
import DataContext from '../../context/DataContext';
import MathConversionImage from '../../images/math-conversion.png'
export default function GuidePage() {
    const gettingStartedRef = useRef()
    const problemNameRef = useRef()
    const specialPlayerExistsRef = useRef()
    const specialPlayerPropsNumRef = useRef()
    const normalPlayerNumRef = useRef()
    const normalPlayerPropsNumRef = useRef()
    const fitnessFunctionRef = useRef()
    const payoffFunctionRef = useRef()
    const maxminRef = useRef()
    const inputToExcelRef = useRef()

    const refArray = [
        gettingStartedRef,
        problemNameRef,
        specialPlayerExistsRef,
        specialPlayerPropsNumRef,
        normalPlayerNumRef,
        normalPlayerPropsNumRef,
        fitnessFunctionRef,
        payoffFunctionRef,
        maxminRef,
        inputToExcelRef]

    const { guideSectionIndex, setGuideSectionIndex } = useContext(DataContext)

    // setup observer for observing the scrolling of the page
    useEffect(() => {

        const options = {
            root: null,
            rootMargin: '150px',
            threshold: 1
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setGuideSectionIndex(Number(entry.target.id))

                }
            });
        }, options);

        observer.observe(gettingStartedRef.current);
        observer.observe(problemNameRef.current);
        observer.observe(specialPlayerExistsRef.current);
        observer.observe(specialPlayerPropsNumRef.current);
        observer.observe(normalPlayerNumRef.current);
        observer.observe(normalPlayerPropsNumRef.current);
        observer.observe(fitnessFunctionRef.current);
        observer.observe(payoffFunctionRef.current);
        observer.observe(inputToExcelRef.current);
        return () => observer.disconnect();
    }, []);


    useEffect(() => {
        const ref = refArray[guideSectionIndex]
        scrollTo(ref)
    }, [])

    function scrollTo(sectionRef) {
        const index = refArray.indexOf(sectionRef)
        setGuideSectionIndex(index)
        sectionRef.current.scrollIntoView(
            {
                behavior: 'instant',
                block: 'start'
            }
        )
    }

    function checkIfHightlight(index) {
        if (index == guideSectionIndex) {
            return 'highlight'
        } else {
            return ''
        }
    }
    return (
        <div className="guide-page">
            <div className="sidebar">
                <div className={`'sidebar__item__title' ${checkIfHightlight(0)}`} onClick={() => scrollTo(gettingStartedRef)}>Getting Started</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(1)}`} onClick={() => scrollTo(problemNameRef)}>Name of the problem</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(2)}`} onClick={() => scrollTo(specialPlayerExistsRef)}>Special Player exists</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(3)}`} onClick={() => scrollTo(specialPlayerPropsNumRef)}>Number of properties of special player</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(4)}`} onClick={() => scrollTo(normalPlayerNumRef)}>Number of normal players</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(5)}`} onClick={() => scrollTo(normalPlayerPropsNumRef)}>Number of properties of each normal player</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(6)}`} onClick={() => scrollTo(fitnessFunctionRef)}>Fitness function</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(7)}`} onClick={() => scrollTo(payoffFunctionRef)}>Player payoff function</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(8)}`} onClick={() => scrollTo(payoffFunctionRef)}>Maximizing and minimizing</div>
                <div className={`'sidebar__item__title' ${checkIfHightlight(9)}`} onClick={() => scrollTo(inputToExcelRef)}>Input to Excel</div>
            </div>

            <div className="content">
                <section className='section' ref={gettingStartedRef} id='0'>
                    <h1>Getting started</h1>
                    <p>Game theory is a branch of mathematics that studies the interactions between rational decision-makers, often modeled as players in a game. The goal of game theory is to understand how people make decisions in strategic situations where the outcome of a decision depends on the actions of others.</p>
                    <p>Game theory provides a framework for analyzing and modeling strategic interactions in a wide range of fields, including economics, political science, psychology, sociology, biology, and computer science. The insights gained from game theory can be applied to many different scenarios, such as business competition, international relations, bargaining, auctions, voting, and social dilemmas.</p>
                    <p>One of the central concepts in game theory is the notion of a Nash equilibrium, which is a set of strategies where no player can benefit by changing their strategy, assuming that all other players keep their strategies unchanged. Game theory also encompasses various solution concepts, such as dominant strategies, Pareto optimality, and correlated equilibrium, which provide different ways of analyzing the outcomes of strategic interactions</p>
                    <p>The MOEA framework is an optimization algorithm that can be used to find Nash equilibria in games. MOEA works by exploring the space of all possible strategies for each player and finding the set of strategies that constitute a Nash equilibrium. This is done by defining an objective function that captures the payoff for each player based on their strategy choices. The MOEA algorithm then optimizes this objective function to find the Nash equilibrium.</p>
                </section>
                <section className='section' ref={problemNameRef} id='1'>
                    <h1>Name of the problem</h1>
                    <p>This section requires the user to provide a name for the problem they are trying to solve using the MOEA framework. The name should be concise and meaningful, reflecting the nature of the game being analyzed. For example, if the game is about two competing companies deciding whether to enter a new market, the name could be "Market Entry Game." Providing a name for the problem helps keep track of different games that are being analyzed and facilitates sharing and collaboration.</p>

                </section>
                <section className='section' ref={specialPlayerExistsRef} id="2">
                    <h1>Special Player exists.</h1>
                    <p>The checkbox in the UI labeled "Special Player" is an option for users to indicate whether or not the game being analyzed involves a player with unique characteristics or advantages not present in the other players. If this option is selected, the user will be prompted to input the number of properties that the special player possesses.</p>
                    <p>In game theory, a special player is a player who is different from the other players in the game. This player is considered special because they may have different objectives, different strategies, or different payoffs compared to the other players.</p>
                    <p>The concept of a special player is commonly used in many game theory models, such as in asymmetric games, where one player has more information or resources than the other players. Special players can also be used to model scenarios where one player has a unique advantage, such as a monopoly or a government agency with regulatory power.</p>
                    <p>One example of a special player in game theory is the leader in a Stackelberg competition model. In this model, one firm acts as a leader and sets their output quantity first, and the other firms act as followers and choose their output quantities after observing the leader's choice. The leader has a unique advantage in this scenario, as they can anticipate the followers' responses and make decisions accordingly.</p>
                    <p>Another example of a special player is a player with a different set of objectives. For instance, in a two-player game where one player is a manufacturer and the other is a retailer, the manufacturer may be interested in maximizing profits, while the retailer may be interested in minimizing inventory costs. In this case, the two players have different objectives and can be considered special players.</p>
                    <p>Overall, the concept of a special player in game theory allows for a more nuanced understanding of different types of players in a game, and can be used to model various real-world scenarios.</p>
                </section>
                <section className='section' ref={specialPlayerPropsNumRef} id="3">
                    <h1>Number of properties of special player.</h1>
                    <p>If the user has selected the checkbox indicating the presence of a special player in the game, the next step is to input the number of properties possessed by this player. This field is a numerical input where the user should enter a positive integer value that corresponds to the number of properties that the special player has.</p>
                    <p>The number of properties possessed by a special player is an important aspect of the game that affects its dynamics and outcomes. In some games, the special player may have a greater influence on the game than other players, and hence their properties could be more significant. In other games, the special player may have a more limited role, and hence their properties may be less significant.</p>
                    <p>In the context of Nash equilibrium and MOEA framework, the number of properties possessed by a special player is used to define the game's parameters and constraints. By inputting this value, the user provides crucial information that allows the algorithm to search for Nash equilibria more effectively.</p>
                    <p>For example, consider a game where there is a special player who has three properties, and four normal players who each have two properties. The algorithm will use this information to generate a set of strategies and payoffs that satisfy the game's constraints and find the Nash equilibrium. Without this input, the algorithm would not be able to consider the special player's properties, and the Nash equilibrium may not be accurate or feasible.</p>
                </section>
                <section className='section' ref={normalPlayerNumRef} id="4">
                    <h1>Number of normal players.</h1>
                    <p>Normal players are the participants in a game theory problem who do not have any special advantages or properties. They are typically considered as equals in terms of decision-making power and available resources. When inputting the number of normal players in the game, it is important to accurately reflect the number of players involved to ensure that the resulting Nash equilibrium is valid for the scenario at hand.</p>
                    <p>The input field for the number of normal players should be a numeric field that only accepts positive integers. The field should have a clear label indicating what it is asking for, such as "Number of normal players." It is also important to provide some context or guidance for the user on how to determine the appropriate number to input. This could be done through the use of placeholder text, a tooltip, or a brief description of the game scenario in the surrounding text.</p>
                    <p>For example, if the game theory problem involves a group of individuals deciding whether to cooperate or compete for a limited resource, the number of normal players might represent the number of individuals involved in the decision-making process. If the problem involves multiple rounds or iterations of the game, the number of normal players might represent the number of participants in each round.</p>
                    <p>Overall, accurately inputting the number of normal players is an important step in finding the Nash equilibrium for a game theory problem. By providing a clear input field and guidance for the user, you can ensure that the resulting equilibrium is meaningful and relevant for the specific scenario being analyzed.</p>
                </section>
                <section className='section' ref={normalPlayerPropsNumRef} id="5">
                    <h1>Number of properties of each normal player.</h1>
                    <p>The next input is the number of properties each normal player possesses. A property in game theory refers to any characteristic or attribute that a player has, which affects their decisions and outcomes in the game. For example, in a game of chess, a player's properties may include the location of their pieces, the number of pieces they have, and their overall strategy. </p>
                    <p>It's important to note that all normal players should have the same number of properties, as it simplifies the calculation of the game's Nash equilibria. If the number of properties differs between players, it can complicate the game and make it more difficult to find a Nash equilibrium. </p>
                    <p>The number of properties each normal player has can vary depending on the game. For example, in a game of chess, each player has 16 pieces with different properties such as movement patterns and point values. In a game of monopoly, each player has a different set of properties such as properties, houses, and hotels.</p>
                </section>
                <section className='section' ref={fitnessFunctionRef} id="6">
                    <h1>Fitness function.</h1>
                    <p>The fitness function is a crucial component of any game theory problem, as it determines the success of a player's strategy in a given game. In simple terms, the fitness function represents the payoff that a player receives for a specific combination of strategies played by all the players in the game.</p>
                    <p>The fitness function is a mathematical function that evaluates how well a player's strategy performs in the game. It is used to determine the relative fitness or success of a strategy in relation to other strategies used by other players in the game. The fitness function is defined based on the payoff matrix of the game, which outlines the outcomes and associated payoffs for each possible combination of player strategies.</p>
                    <p>The fitness function can take on various forms depending on the type of game being analyzed. For example, in a two-player zero-sum game, the fitness function is typically represented by a single scalar value representing the payoff to one player, with the payoff to the other player being the negative of this value. In contrast, in a cooperative game, the fitness function represents the collective payoff of all the players, and may be more complex to calculate.</p>
                    <p>In the context of the MOEA framework, the fitness function is often formulated as an optimization problem, where the goal is to find the set of strategies that maximize the expected payoff of a player or group of players. This requires the use of mathematical tools such as optimization algorithms and numerical methods.</p>
                    <p>It is important to note that the fitness function is specific to the game being analyzed and must be carefully designed to reflect the objectives and constraints of the problem. A poorly designed fitness function can lead to incorrect or suboptimal solutions, so it is crucial to spend time understanding the game and its underlying dynamics before formulating the fitness function.</p>
                    <p>Fitness function need to be converted from mathematical formula into a form of a string expression that can be parsed by the app. </p>
                    <p>Note: It's important to note that the string expression must be correctly formatted with respect to order of operations, parentheses, and other mathematical conventions. Any mistakes in formatting could lead to incorrect results when the app processes the fitness function.</p>
                    <div className="gray-board">
                        <img src={MathConversionImage} alt="" />
                    </div>

                </section>
                <section className='section' ref={payoffFunctionRef} id='7'>
                    <h1>Player payoff function.</h1>
                    <p>The player payoff function represents the benefit or utility that a player can get from a certain strategy or set of strategies in the game. In game theory, the payoff function is typically represented as a table or matrix where each row corresponds to a strategy of one player and each column corresponds to a strategy of the other player.</p>
                    <p>It is important to note that the payoff function should satisfy the rationality assumption of the players. That is, each player will choose the strategy that maximizes their expected payoff given the other player's strategy. This is the basis for finding the Nash equilibrium of the game.</p>
                    <p>The payoff function can be a function of the properties of the players, the strategies chosen by the players, or both. In this case, the MOEA framework will construct the payoff function using the number of properties for each normal player and the existence of a special player. The framework will ensure that the payoff function takes into account the properties of each player when calculating the payoff.</p>
                    <p>For example, if there are two properties for each player, the payoff function should be input such that it takes into account the two properties of each normal player. This ensures that the payoff function accurately reflects the game being played and provides an appropriate measure of the players' success.</p>
                    <p>In the context of game theory, a payoff function is a mathematical formula that calculates the payoffs for each player in a game, based on the strategies they choose. To use a payoff function in an app, the user needs to input the formula as a string expression.</p>
                    <div className="gray-board">
                        <img src={MathConversionImage} alt="" />
                    </div>

                </section>

                <section className='section' ref={maxminRef} id='8'>
                    <h1>Maximizing and minimizing.</h1>
                    <p>In game theory, maximizing refers to the strategy of attempting to achieve the best possible outcome or highest payoff in a game. This means that a player will try to make decisions and take actions that lead to the most favorable outcome for themselves, even if this means that other players may not benefit as much or may even suffer negative consequences.</p>
                    <p>On the other hand, minimizing refers to the strategy of trying to achieve the least possible negative outcome or lowest payoff in a game. This means that a player will try to avoid making decisions and taking actions that could lead to a negative outcome for themselves, even if this means that they may not receive the most favorable outcome.</p>
                    <p>One example of maximizing in game theory is in a game of poker. In poker, a player may make decisions that maximize their potential to win the hand and earn the highest possible payoff. This may involve taking risks, such as betting a large sum of money, in order to increase the potential payoff.</p>
                    <p>On the other hand, an example of minimizing in game theory is in a game of chicken. In this game, two drivers are racing towards each other and the first to swerve to avoid a collision loses. In this situation, a driver may be motivated to minimize their potential for negative outcomes, such as crashing or being injured, by swerving before the collision occurs.</p>
                    <p>Note: If a game is maximizing, the payoff function should be negative,</p>
                </section>
                <section className='section' ref={inputToExcelRef} id='9'>
                    <h1>Input to Excel</h1>
                    <div className="steps">
                        <b>Input problem data</b>
                        <ol>
                            <li>Fill out the necessary information about the problem in the "Problem Information" sheet, including the problem name, whether a special player exists, the number of properties of the special player, the number of normal players, the number of properties of each normal player, the fitness function, and the player payoff function.</li>
                            <li>If a special player exists, fill out the data of the properties and weights of the special player in the "Special Player" sheet.</li>
                            <li>Fill out all the necessary data about normal players, including name, number of strategies, and property data of each strategy, in the "Normal Players" sheet.</li>
                            <li>If necessary, conflict set of strategies to the sheet "Conflict Set".</li>
                            <li>Save the Excel file.</li>
                        </ol>
                    </div>

                    <div className="gray-board">
                        <p>Try it here</p>
                    </div>
                    <div className="steps">
                        <b>Process the Excel file</b>
                        <ol>
                            <li>Open the drag and drop area in the application.</li>
                            <li>Drag and drop the Excel file into the designated area.</li>
                            <li>Wait for the application to process the file.</li>
                            <li>Review the game theory problem information and data in the application.</li>
                        </ol>

                    </div>
                    <div className="gray-board">

                    <iframe width="560" height="315" src="https://www.youtube.com/embed/Cn77RdWB6s8?si=jPKULyuFudKvD_7V" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>                  
                    </div>
                </section>
            </div>
        </div>
    )
}   